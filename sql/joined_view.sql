DROP MATERIALIZED VIEW pension_data_all;

CREATE MATERIALIZED VIEW pension_data_all AS
 SELECT p.managing_body,
    p.fund,
    funds.fund_name,
    p.report_year,
    p.report_qurater,
    p.instrument_type,
    p.instrument_sub_type,
    -- --------------------------------------------------
	 --  handel instrument_id:  in case contain IL leave only the number
    -- --------------------------------------------------
 	COALESCE(ins_data.instrument_id,
 	  COALESCE(isin_fix.fix_instrument_id,
    	(	case
    				when p.instrument_id ~ 'IL' then regexp_replace(substring(p.instrument_id from 'IL\d+\w'),'IL','')
    				else p.instrument_id
        	end
    		 )
		  )
		) as instrument_id,
	 p.instrument_id as orig_instrument_id,

    -- --------------------------------------------------
	 --  handel instrument_location:  indication where the instrment is located - 0 - israel, 1 - abrod, 2 - error
    -- --------------------------------------------------
	 -- case
	 -- 		when COALESCE(p.currency, 'NIS'::character varying(128)) ~* 'NIS' then 0
 	 -- 		when p.instrument_id ~ '^\d+\s?\-?\s?\d+$' 			then 0
 	 -- 		when p.instrument_id ~ 'IL' 					then 0
 	 -- 		when p.instrument_id ~* '[א-ת]' 				then 0
	 -- 		when p.instrument_id ~* '^\d*(\s..)*\-?[A-Z][A-Z]' 		then 1
	 -- 		when p.instrument_id ~* '\d\s?\-?\s?[A-Z][A-Z]\d' 		then 1
	 -- 		else 2
-- 	end as asset_location,

    -- --------------------------------------------------
	 --  handel instrument_name
    -- --------------------------------------------------		case
--        CASE
--            WHEN
--            p.instrument_sub_type::text = ANY (ARRAY['חוזים עתידיים'::character varying, 'אופציות'::character varying]::text[]) THEN p.instrument_sub_type
--            ELSE
--              COALESCE(ins_data.instrument_name, ext_data.instrument_name, p.instrument_symbol, p.instrument_id)
--        END
        COALESCE(ins_data.instrument_name, ext_data.instrument_name, p.instrument_symbol, p.instrument_id)
            AS instrument_name,
    -- --------------------------------------------------
	 --  handel issuer
    -- --------------------------------------------------		case
        CASE
            WHEN p.instrument_sub_type::text like '%ממשלתיות%'::text AND
						(  p.currency::text 	= 'NIS'::text
						or p.instrument_symbol 		~* '.*israel.*'
						or p.instrument_symbol 		~* '.*ישראל.*'
						)
					THEN 'ממשלת ישראל'::character varying(128)
				When iss_ext.issuer is not null
					Then iss_ext.issuer
            ELSE ext_data.issuer
        END AS issuer,
	-- -------------------------------------------------------------------------------------------------------------------
   -- fix activity_industry
   -- -------------------------------------------------------------------------------------------------------------------
    COALESCE(ins_data.company_sub_type,
		( lower(btrim(
	        CASE
	            WHEN p.instrument_sub_type::text ~~ '%מניות%'::text THEN COALESCE(ext_data.activity_industry, fix_ind.new_activity_industry, p.industry, 'אחר'::character varying(128))
	            WHEN p.instrument_sub_type::text ~~ '%קונצרני%'::text THEN COALESCE(ext_data.activity_industry, fix_ind.new_activity_industry, p.industry, 'אחר'::character varying(128))
	            WHEN p.instrument_sub_type::text ~~ '%תעודות חוב%'::text THEN COALESCE(ext_data.activity_industry, fix_ind.new_activity_industry, p.industry, 'אחר'::character varying(128))
	            WHEN p.instrument_sub_type::text ~~ '%תעודות התחייבות מסחריות%'::text THEN COALESCE(ext_data.activity_industry, fix_ind.new_activity_industry, p.industry, 'אחר'::character varying(128))
	            WHEN p.instrument_sub_type::text ~~ '%כתבי אופציה%'::text THEN COALESCE(ext_data.activity_industry, fix_ind.new_activity_industry, p.industry, 'אחר'::character varying(128))
	            WHEN p.instrument_sub_type::text ~~ '%תעודות סל%'::text THEN COALESCE(ext_data.activity_industry, fix_ind.new_activity_industry, p.industry, NULL::character varying(128))
	            WHEN p.instrument_sub_type::text ~~ '%קרנות%'::text THEN 'אחר'::character varying(128)
	            WHEN p.instrument_type::text ~~ '%הלוואות%'::text THEN NULL::character varying(128)
	            WHEN p.instrument_type::text ~~ '%זכויות מקרקעין%'::text THEN NULL::character varying(128)
	            WHEN p.instrument_sub_type::text ~~ '%ממשלתיות%'::text THEN NULL::character varying(128)
	            WHEN p.instrument_sub_type::text = ANY (ARRAY['חוזים עתידיים'::character varying, 'מוצרים מובנים'::character varying, 'אופציות'::character varying]::text[]) THEN NULL::character varying(128)
	            WHEN p.instrument_type::text = ANY (ARRAY['מזומנים'::character varying, 'פקדונות'::character varying]::text[]) THEN NULL::character varying(128)
	            ELSE 'לא מסווג'::character varying(128)
	        END::text))
        )
      )
		  AS activity_industry,

   -- -------------------------------------------------------------------------------------------------------------------
   -- fix currency
   -- -------------------------------------------------------------------------------------------------------------------
    upper(case
    			when p.currency like '%אוסטרלי%' 		then 'AUD'
    			when p.currency =    'אוסטר' 				then 'AUD'
    			when p.currency like '%ד%ה%קונג%' 		then 'HKD'
    			when p.currency like '%ד%ניו זילנד%' 	then 'ZND'
    			when p.currency like 'ניו זילנד%'      then 'ZND'
    			when p.currency like '%ניו%זילנד%'     then 'ZND'
    			when p.currency like '%קנדי%' 			then 'CAD'
    			when p.currency like '%ארהב%' 			then 'USD'
    			when p.currency like '%דולר%אמריק%' 	then 'USD'
    			when p.currency = 	'דולר דנאל' 		then 'USD'
				when p.currency like '%ד%סינגפור%' 		then 'SGD'
				when p.currency like '%יואן סיני%' 		then 'CNY'
				when p.currency like '%יין יפני%' 		then 'JPY'
				when p.currency like '%כת%שודי%' 		then 'SEK'
				when p.currency like 'כתר שוודי%' 		then 'SEK'
				when p.currency like '%כת%דני%' 			then  'DKK'
				when p.currency like '%כתר נורוגיה%' 	then 'NOK'
				when p.currency like '%הונג קונג%' 		then 'HKD'
				when p.currency like '%לישט'				then 'GBP'
				when p.currency like 'לישט%' 				then 'GBP'
				when p.currency = 'שטרלינג דנאל'			then 'GBP'
				when p.currency like '%ברזילאי%' 		then 'BRL'
				when p.currency like '%רנד דראפ%' 		then 'ZAR'
				when p.currency like 'פזו מכסיקני%'		then 'MXN'
				when p.currency like '%מקסיקו%פזו%'		then 'MXN'
				when p.currency like '%רובל רוסי%'		then 'RUB'
				when p.currency like '%רופיה הודית%' 	then 'INR'
				when p.currency like '%רופי%הודי%' 	  then 'INR'
				when p.currency = 'שק'    		  	  		then 'NIS'
				when p.currency = 'מדד מחירים לצרכן' 	then 'NIS'
				when p.currency = 'ליש' 			   	then 'GBP'
				when p.currency = 'EURO'          		then 'EUR'
				when p.currency = 'פרש'          		then 'CHF'
	 			else COALESCE(p.currency, 'NIS'::character varying(128))
		END::text) AS currency,

    COALESCE(p.fair_value, 0::numeric) * 1000::numeric + COALESCE(p.market_cap, 0::numeric) * 1000::numeric AS fair_value,
    0::numeric AS market_cap,
    p.rate_of_fund,
    p.rating_agency,
    ext_data.reference_index,
    p.intrest_rate,
    p.date_of_purchase,
    p.average_of_duration,
    p.date_of_revaluation,
    p.rate,
    p.yield,
        CASE
            WHEN p.rating_agency::text = 'פנימי'::text 	THEN 'פנימי'::character varying(128)
            WHEN p.rating::text = 'Aaa'::text 				THEN 'AAA'::character varying(128)
            WHEN p.rating::text = 'Aa1'::text 				THEN 'AA+'::character varying(128)
            WHEN p.rating::text = 'Aa2'::text 				THEN 'AA'::character varying(128)
            WHEN p.rating::text = 'Aa3'::text 				THEN 'AA-'::character varying(128)
            WHEN p.rating::text = 'A1'::text 				THEN 'A+'::character varying(128)
            WHEN p.rating::text = 'A2'::text 				THEN 'A'::character varying(128)
            WHEN p.rating::text = 'A3'::text 				THEN 'A-'::character varying(128)
            WHEN p.rating::text = 'Baa1'::text 				THEN 'BBB+'::character varying(128)
            WHEN p.rating::text = 'Baa2'::text 				THEN 'BBB'::character varying(128)
            WHEN p.rating::text = 'Baa3'::text 				THEN 'BBB-'::character varying(128)
            WHEN p.rating::text = 'Ba1'::text 				THEN 'BB+'::character varying(128)
            WHEN p.rating::text = 'Ba2'::text 				THEN 'BB'::character varying(128)
            WHEN p.rating::text = 'Ba3'::text 				THEN 'BB-'::character varying(128)
            WHEN p.rating::text = 'B1'::text 				THEN 'B+'::character varying(128)
            WHEN p.rating::text = 'B2'::text 				THEN 'B'::character varying(128)
            WHEN p.rating::text = 'B3'::text 				THEN 'B-'::character varying(128)
            WHEN p.rating::text = 'Caa'::text 				THEN 'CCC+'::character varying(128)
            WHEN p.rating::text = 'Caa2'::text 				THEN 'CCC'::character varying(128)
            WHEN p.rating::text = 'Ca'::text 				THEN 'CCC'::character varying(128)
            WHEN p.rating::text = 'C'::text 					THEN 'CCC-'::character varying(128)
            WHEN p.rating::text = 'RF'::text 				THEN 'AAA'::character varying(128)
            WHEN p.rating::text = 'rf'::text 				THEN 'AAA'::character varying(128)
            WHEN p.rating::text ~* '.*N.*R.*'::text 			THEN 'לא מדורג'::character varying(128)
--             WHEN p.rating::text like '%N%R%'::text 			THEN 'לא מדורג'::character varying(128)
            WHEN p.rating::text = 'nr'::text 				THEN 'לא מדורג'::character varying(128)
            WHEN p.rating::text = 'd'::text THEN 'D'::character varying(128)
				WHEN p.rating::text = '+bbb'::text THEN 'BBB+'::character varying(128)
-- 				WHEN p.rating::text = 'bbb'::text THEN 'BBB'::character varying(128)
-- 				WHEN p.rating::text = 'aaa'::text THEN 'AAA'::character varying(128)
				WHEN p.rating::text = '-aa'::text THEN 'AA-'::character varying(128)
-- 				WHEN p.rating::text = 'aa'::text THEN 'AA'::character varying(128)
				WHEN p.rating::text = '+a'::text THEN 'A+'::character varying(128)
				WHEN p.rating::text = '-a'::text THEN 'A-'::character varying(128)
				WHEN p.rating::text = 'ללא דירוג'::text THEN 'לא מדורג'::character varying(128)
				WHEN p.rating::text Like '%דורג%'::text THEN 'לא מדורג'::character varying(128)
				WHEN p.rating::text Like '%דירוג%'::text THEN 'לא מדורג'::character varying(128)
-- 				WHEN p.rating::text = 'NR3'::text THEN 'לא מדורג'::character varying(128)
            When (p.rating is null or p.rating like '%0%' or p.rating = '-')
					and
					(		p.instrument_sub_type in ('תעודות התחייבות ממשלתיות', 'תעודות חוב מסחריות', 'אג"ח קונצרני')
					 or 	p.instrument_type = 'הלוואות') 		Then 'לא דווח'::character varying(128)
				when (p.rating like '%0%' or p.rating = '-')
					and
					(	p.instrument_sub_type is null
						or p.instrument_sub_type not in ('תעודות התחייבות ממשלתיות', 'תעודות חוב מסחריות', 'אג"ח קונצרני')
					)
					and not	p.instrument_type = 'הלוואות' 		Then null

            ELSE upper(p.rating)
        END AS rating,
    p.par_value,
    p.tmp_name,
    p.underlying_asset,
    p.type_of_asset,
   -- -------------------------------------------------------------------------------------------------------------------
   -- fix rate_of_ipo - the rate is a presentege need to be between 0 to 100
   -- -------------------------------------------------------------------------------------------------------------------
	 	case
		 	when  p.rate_of_ipo>100 then null
		 	else p.rate_of_ipo
		END as rate_of_ipo,
    liq.liquidity,
    liq.asset_type
   FROM production p
   	LEFT JOIN prod_instrument_data ins_data   ON (p.instrument_id = ins_data.prod_instrument_id and p.instrument_type = 'ניירות ערך סחירים')
   	LEFT JOIN ext_instrument_data ext_data 	ON (p.instrument_id::text = ext_data.instrument_id::text)
   	LEFT JOIN fix_activity_industry fix_ind 	ON (p.industry = fix_ind.old_activity_industry)
   	LEFT JOIN funds 									ON (p.fund = funds.fund_id)
   	LEFT JOIN liquidity liq 						ON (liq.instrument_type::text = p.instrument_type::text
	  																AND (liq.instrument_sub_type::text = p.instrument_sub_type::text
																	  OR p.instrument_sub_type IS NULL)
																)
     LEFT JOIN issuer_data_ext iss_ext 			ON (iss_ext.instrument_type = p.instrument_type
	  																AND iss_ext.instrument_sub_type = p.instrument_sub_type
																	AND ( iss_ext.instrument_id = p.instrument_id
																		OR p.instrument_id like 'IL' || iss_ext.instrument_id || '%'
																		)
															   )
		LEFT JOIN instrument_id_fix isin_fix  ON (p.instrument_id = isin_fix.instrument_id)
  WHERE p.instrument_type::text <> 'סכום נכסי הקרן'::text and p.currency not in ('1','2','3','4','5','6','7','8','9','10','11','12','אחוזים')
WITH DATA;

