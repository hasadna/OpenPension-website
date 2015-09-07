 DROP MATERIALIZED VIEW pension_data_alltemp;

CREATE MATERIALIZED VIEW pension_data_alltemp AS 
 SELECT production.managing_body,
    production.fund,
    funds.fund_name,
    production.report_year,
    production.report_qurater,
    production.instrument_type,
    production.instrument_sub_type,
    -- --------------------------------------------------
	 --  handel instrument_id:  in case contain IL leave only the number
    -- --------------------------------------------------
    	case
			when production.instrument_id ~ 'IL' then regexp_replace(substring(production.instrument_id from 'IL\d+\w'),'IL','') 
			else production.instrument_id 
    	end as instrument_id,
	production.instrument_id as orig_instrument_id,
		
    -- --------------------------------------------------
	 --  handel instrument_location:  indication where the instrment is located - 0 - israel, 1 - abrod, 2 - error
    -- --------------------------------------------------		
--	case
--			when COALESCE(production.currency, 'NIS'::character varying(128)) ~* 'NIS' then 0
-- 			when production.instrument_id ~ '^\d+\s?\-?\s?\d+$' 			then 0
-- 			when production.instrument_id ~ 'IL' 					then 0
-- 			when production.instrument_id ~* '[א-ת]' 				then 0
--			when production.instrument_id ~* '^\d*(\s..)*\-?[A-Z][A-Z]' 		then 1 
--			when production.instrument_id ~* '\d\s?\-?\s?[A-Z][A-Z]\d' 		then 1 
--			else 2
-- 	end as asset_location,
    
    -- --------------------------------------------------
	 --  handel instrument_name
    -- --------------------------------------------------		case
        CASE
            WHEN production.instrument_sub_type::text = ANY (ARRAY['חוזים עתידיים'::character varying, 'אופציות'::character varying]::text[]) THEN production.instrument_sub_type
            ELSE COALESCE(ext_data.instrument_name, production.instrument_symbol, production.instrument_id)
        END AS instrument_name,
    -- --------------------------------------------------
	 --  handel issuer
    -- --------------------------------------------------		case
        CASE
            WHEN production.instrument_sub_type::text like '%ממשלתיות%'::text AND 
						(  production.currency::text 	= 'NIS'::text 
						or production.instrument_symbol 		~* '.*israel.*'
						or production.instrument_symbol 		~* '.*ישראל.*'
						)
					THEN 'ממשלת ישראל'::character varying(128)
				When iss_ext.issuer is not null
					Then iss_ext.issuer
            ELSE ext_data.issuer
        END AS issuer,
	-- -------------------------------------------------------------------------------------------------------------------
   -- fix activity_industry
   -- -------------------------------------------------------------------------------------------------------------------
    lower(btrim(
        CASE
            WHEN production.instrument_sub_type::text ~~ '%מניות%'::text THEN COALESCE(ext_data.activity_industry, fix_ind.new_activity_industry, production.industry, 'אחר'::character varying(128))
            WHEN production.instrument_sub_type::text ~~ '%קונצרני%'::text THEN COALESCE(ext_data.activity_industry, fix_ind.new_activity_industry, production.industry, 'אחר'::character varying(128))
            WHEN production.instrument_sub_type::text ~~ '%תעודות חוב%'::text THEN COALESCE(ext_data.activity_industry, fix_ind.new_activity_industry, production.industry, 'אחר'::character varying(128))
            WHEN production.instrument_sub_type::text ~~ '%תעודות התחייבות מסחריות%'::text THEN COALESCE(ext_data.activity_industry, fix_ind.new_activity_industry, production.industry, 'אחר'::character varying(128))
            WHEN production.instrument_sub_type::text ~~ '%כתבי אופציה%'::text THEN COALESCE(ext_data.activity_industry, fix_ind.new_activity_industry, production.industry, 'אחר'::character varying(128))
            WHEN production.instrument_sub_type::text ~~ '%תעודות סל%'::text THEN COALESCE(ext_data.activity_industry, fix_ind.new_activity_industry, production.industry, NULL::character varying(128))
            WHEN production.instrument_sub_type::text ~~ '%קרנות%'::text THEN 'אחר'::character varying(128)
            WHEN production.instrument_type::text ~~ '%הלוואות%'::text THEN NULL::character varying(128)
            WHEN production.instrument_type::text ~~ '%זכויות מקרקעין%'::text THEN NULL::character varying(128)
            WHEN production.instrument_sub_type::text ~~ '%ממשלתיות%'::text THEN NULL::character varying(128)
            WHEN production.instrument_sub_type::text = ANY (ARRAY['חוזים עתידיים'::character varying, 'מוצרים מובנים'::character varying, 'אופציות'::character varying]::text[]) THEN NULL::character varying(128)
            WHEN production.instrument_type::text = ANY (ARRAY['מזומנים'::character varying, 'פקדונות'::character varying]::text[]) THEN NULL::character varying(128)
            ELSE 'לא מסווג'::character varying(128)
        END::text)) AS activity_industry,

   -- -------------------------------------------------------------------------------------------------------------------
   -- fix currency
   -- -------------------------------------------------------------------------------------------------------------------
    upper(case 
    			when production.currency like '%אוסטרלי%' 		then 'AUD'
    			when production.currency =    'אוסטר' 				then 'AUD'
    			when production.currency like '%ד%ה%קונג%' 		then 'HKD'
    			when production.currency like '%ד%ניו זילנד%' 	then 'ZND'
    			when production.currency like 'ניו זילנד%'      then 'ZND'
    			when production.currency like '%קנדי%' 			then 'CAD'
    			when production.currency like '%ארהב%' 			then 'USD'
    			when production.currency = 	'דולר דנאל' 		then 'USD'
				when production.currency like '%ד%סינגפור%' 		then 'SGD'
				when production.currency like '%יואן סיני%' 		then 'CNY'
				when production.currency like '%יין יפני%' 		then 'JPY'
				when production.currency like '%כת%שודי%' 		then  'SEK'
				when production.currency like 'כתר שוודי%' 		then 'SEK'
				when production.currency like '%כת%דני%' 		then  'DKK'
				when production.currency like '%כתר נורוגיה%' 		then 'NOK'
				when production.currency like '%הונג קונג%' 		then 'HKD'
				when production.currency like '%לישט'				then 'GBP'
				when production.currency like 'לישט%' 				then 'GBP'
				when production.currency = 'שטרלינג דנאל'			then 'GBP'
				when production.currency like '%ברזילאי%' 		then 'BRL'
				when production.currency like '%רנד דראפ%' 		then 'ZAR'
				when production.currency like 'פזו מכסיקני%'		then 'MXN'
				when production.currency like '%רובל רוסי%'		then 'RUB'
				when production.currency like '%רופיה הודית%' 	then 'INR'
				when production.currency = 'שק'    		  	  	then 'NIS'
				when production.currency = 'ליש' 			   then 'GBP'
				when production.currency = 'EURO'          		then 'EUR'
				when production.currency = 'פרש'          		then  'CHF'
	 			else COALESCE(production.currency, 'NIS'::character varying(128)) 
		END::text) AS currency,
    
    COALESCE(production.fair_value, 0::numeric) * 1000::numeric + COALESCE(production.market_cap, 0::numeric) * 1000::numeric AS fair_value,
    0::numeric AS market_cap,
    production.rate_of_fund,
    production.rating_agency,
    ext_data.reference_index,
    production.intrest_rate,
    production.date_of_purchase,
    production.average_of_duration,
    production.date_of_revaluation,
    production.rate,
    production.yield,
        CASE
            WHEN production.rating_agency::text = 'פנימי'::text 	THEN 'פנימי'::character varying(128)
            WHEN production.rating::text = 'Aaa'::text 				THEN 'AAA'::character varying(128)
            WHEN production.rating::text = 'Aa1'::text 				THEN 'AA+'::character varying(128)
            WHEN production.rating::text = 'Aa2'::text 				THEN 'AA'::character varying(128)
            WHEN production.rating::text = 'Aa3'::text 				THEN 'AA-'::character varying(128)
            WHEN production.rating::text = 'A1'::text 				THEN 'A+'::character varying(128)
            WHEN production.rating::text = 'A2'::text 				THEN 'A'::character varying(128)
            WHEN production.rating::text = 'A3'::text 				THEN 'A-'::character varying(128)
            WHEN production.rating::text = 'Baa1'::text 				THEN 'BBB+'::character varying(128)
            WHEN production.rating::text = 'Baa2'::text 				THEN 'BBB'::character varying(128)
            WHEN production.rating::text = 'Baa3'::text 				THEN 'BBB-'::character varying(128)
            WHEN production.rating::text = 'Ba1'::text 				THEN 'BB+'::character varying(128)
            WHEN production.rating::text = 'Ba2'::text 				THEN 'BB'::character varying(128)
            WHEN production.rating::text = 'Ba3'::text 				THEN 'BB-'::character varying(128)
            WHEN production.rating::text = 'B1'::text 				THEN 'B+'::character varying(128)
            WHEN production.rating::text = 'B2'::text 				THEN 'B'::character varying(128)
            WHEN production.rating::text = 'B3'::text 				THEN 'B-'::character varying(128)
            WHEN production.rating::text = 'Caa'::text 				THEN 'CCC+'::character varying(128)
            WHEN production.rating::text = 'Caa2'::text 				THEN 'CCC'::character varying(128)
            WHEN production.rating::text = 'Ca'::text 				THEN 'CCC'::character varying(128)
            WHEN production.rating::text = 'C'::text 					THEN 'CCC-'::character varying(128)
            WHEN production.rating::text = 'RF'::text 				THEN 'AAA'::character varying(128)
            WHEN production.rating::text = 'rf'::text 				THEN 'AAA'::character varying(128)
            WHEN production.rating::text ~* '.*N.*R.*'::text 			THEN 'לא מדורג'::character varying(128)
--             WHEN production.rating::text like '%N%R%'::text 			THEN 'לא מדורג'::character varying(128)
            WHEN production.rating::text = 'nr'::text 				THEN 'לא מדורג'::character varying(128)
            WHEN production.rating::text = 'd'::text THEN 'D'::character varying(128)
				WHEN production.rating::text = '+bbb'::text THEN 'BBB+'::character varying(128)
-- 				WHEN production.rating::text = 'bbb'::text THEN 'BBB'::character varying(128)
-- 				WHEN production.rating::text = 'aaa'::text THEN 'AAA'::character varying(128)
				WHEN production.rating::text = '-aa'::text THEN 'AA-'::character varying(128)
-- 				WHEN production.rating::text = 'aa'::text THEN 'AA'::character varying(128)
				WHEN production.rating::text = '+a'::text THEN 'A+'::character varying(128)
				WHEN production.rating::text = '-a'::text THEN 'A-'::character varying(128)
				WHEN production.rating::text = 'ללא דירוג'::text THEN 'לא מדורג'::character varying(128)
				WHEN production.rating::text Like '%דורג%'::text THEN 'לא מדורג'::character varying(128)
				WHEN production.rating::text Like '%דירוג%'::text THEN 'לא מדורג'::character varying(128)
-- 				WHEN production.rating::text = 'NR3'::text THEN 'לא מדורג'::character varying(128)
            When (production.rating is null or production.rating like '%0%' or production.rating = '-')
					and 
					(		production.instrument_sub_type in ('תעודות התחייבות ממשלתיות', 'תעודות חוב מסחריות', 'אג"ח קונצרני')
					 or 	production.instrument_type = 'הלוואות') 		Then 'לא דווח'::character varying(128)
				when (production.rating like '%0%' or production.rating = '-')
					and 
					(	production.instrument_sub_type is null 	
						or production.instrument_sub_type not in ('תעודות התחייבות ממשלתיות', 'תעודות חוב מסחריות', 'אג"ח קונצרני')
					)
					and not	production.instrument_type = 'הלוואות' 		Then null
					 				
            ELSE upper(production.rating)
        END AS rating,
    production.par_value,
    production.tmp_name,
    production.underlying_asset,
    production.type_of_asset,
   -- -------------------------------------------------------------------------------------------------------------------
   -- fix rate_of_ipo - the rate is a presentege need to be between 0 to 100
   -- -------------------------------------------------------------------------------------------------------------------   
	 	case
		 	when  production.rate_of_ipo>100 then null
		 	else production.rate_of_ipo
		END as rate_of_ipo, 	
    liquidity.liquidity,
    liquidity.asset_type
   FROM production
     LEFT JOIN ext_instrument_data ext_data 	ON (production.instrument_id::text = ext_data.instrument_id::text)
     left join fix_activity_industry fix_ind on (production.industry = fix_ind.old_activity_industry)
     LEFT JOIN funds 								ON (production.fund = funds.fund_id)
     LEFT JOIN liquidity 							ON (liquidity.instrument_type::text = production.instrument_type::text 
	  																AND (liquidity.instrument_sub_type::text = production.instrument_sub_type::text 
																	  OR production.instrument_sub_type IS NULL)
																)
     LEFT JOIN issuer_data_ext iss_ext 		ON (iss_ext.instrument_type = production.instrument_type 
	  															AND iss_ext.instrument_sub_type = production.instrument_sub_type
																AND ( iss_ext.instrument_id = production.instrument_id OR  production.instrument_id like 'IL' || iss_ext.instrument_id || '%' )
															   )
  WHERE production.instrument_type::text <> 'סכום נכסי הקרן'::text and production.currency not in ('1','2','3','4','5','6','7','8','9','10','11','12','אחוזים')
WITH DATA;

