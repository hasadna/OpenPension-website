CREATE OR REPLACE VIEW pension_data_all AS 
 SELECT 
    production.managing_body,
    production.fund,
    funds.fund_name,
    production.report_year, 
    production.report_qurater, 
    production.instrument_type, 
    production.instrument_sub_type,
    production.instrument_id,
    case 	when production.instrument_sub_type in ('חוזים עתידיים', 'אופציות')	then production.instrument_sub_type
		else COALESCE(ext.instrument_name,production.instrument_symbol,production.instrument_id)
    end					as instrument_name,
    
--    (production.instrument_id || ' - '::character varying(128) || (COALESCE(ext.instrument_name,production.instrument_symbol)))::character varying(128) as instrument_name,
    ext.issuer, 
    case 	when production.instrument_sub_type like '%מניות%' 		then COALESCE(ext.activity_industry,production.industry,'אחר'::character varying(128))
		when production.instrument_sub_type like '%קונצרני%' 		then COALESCE(ext.activity_industry,production.industry,'אחר'::character varying(128))
		when production.instrument_sub_type like '%כתבי אופציה%' 	then COALESCE(ext.activity_industry,production.industry,'אחר'::character varying(128))
		when production.instrument_sub_type like '%תעודות סל%' 	then COALESCE(ext.activity_industry,production.industry,'ללא סיווג'::character varying(128))
		when production.instrument_sub_type like '%קרנות%' 		then 'אחר'::character varying(128)
		when production.instrument_type     like '%הלוואות%' 		then 'אחר'::character varying(128)
		when production.instrument_sub_type like '%ממשלתיות%'		then 'ללא סיווג'::character varying(128)
		when production.instrument_sub_type in ('חוזים עתידיים', 'מוצרים מובנים', 'אופציות')	then 'ללא סיווג'::character varying(128)
		when production.instrument_type in ('מזומנים','פקדונות')	then 'ללא סיווג'::character varying(128)
		else 							     'ללא סיווג'::character varying(128)
    end					as activity_industry,
--    production.currency,     
    COALESCE(production.currency,'NIS'::character varying(128)) 	as currency,     
    (COALESCE(production.fair_value,0))*1000 	as fair_value, 
    (COALESCE(production.market_cap,0))*1000 	as market_cap, 
    production.rate_of_fund, 
    production.rating_agency, 
    ext.reference_index, 
    production.intrest_rate, 
    production.date_of_purchase, 
    production.average_of_duration, 
    production.date_of_revaluation, 
    production.rate,
    production.yield, 
    case	when production.rating_agency = 'פנימי' 		then 'פנימי'::character varying(128)
		when production.rating = 'Aaa' 				then 'AAA'::character varying(128)
		when production.rating = 'Aa1' 				then 'AA+'::character varying(128)
		when production.rating = 'Aa2' 				then 'AA'::character varying(128)
		when production.rating = 'Aa3' 				then 'AA-'::character varying(128)
		when production.rating = 'A1' 				then 'A+'::character varying(128)
		when production.rating = 'A2' 				then 'A'::character varying(128)
		when production.rating = 'A3' 				then 'A-'::character varying(128)
		when production.rating = 'Baa1' 			then 'BBB+'::character varying(128)
		when production.rating = 'Baa2' 			then 'BBB'::character varying(128)
		when production.rating = 'Baa3' 			then 'BBB-'::character varying(128)
		when production.rating = 'Ba1' 				then 'BB+'::character varying(128)
		when production.rating = 'Ba2' 				then 'BB'::character varying(128)
		when production.rating = 'Ba3' 				then 'BB-'::character varying(128)
		when production.rating = 'B1' 				then 'B+'::character varying(128)
		when production.rating = 'B2' 				then 'B'::character varying(128)
		when production.rating = 'B3' 				then 'B-'::character varying(128)
		when production.rating = 'Caa' 				then 'CCC+'::character varying(128)
		when production.rating = 'Caa2' 			then 'CCC'::character varying(128)
		when production.rating = 'Ca' 				then 'CCC'::character varying(128)
		when production.rating = 'C' 				then 'CCC-'::character varying(128)
		when production.rating = 'RF' 				then 'AAA'::character varying(128)
		when production.rating = 'NR' 				then 'לא מדורג'::character varying(128)
		else 							     production.rating
    end 				as rating, 
    production.par_value,
    production.tmp_name, 
    production.underlying_asset, 
    production.type_of_asset, 
    production.rate_of_ipo, 
    liquidity.liquidity,
    liquidity.asset_type 
   FROM production
   LEFT JOIN ext ON (production.instrument_id::text = ext.instrument_id::text)
   LEFT JOIN funds ON (production.fund = funds.fund_id)
   LEFT JOIN liquidity ON (liquidity.instrument_type::text = production.instrument_type::text 
			and (liquidity.instrument_sub_type::text = production.instrument_sub_type::text
				or production.instrument_sub_type is null))
  WHERE -- (production.instrument_id::text <> ''::text AND production.instrument_id IS NOT NULL)
	 (production.instrument_symbol::text <> ''::text AND production.instrument_symbol IS NOT NULL)
	 and production.instrument_type<>'סכום נכסי הקרן';

ALTER TABLE pension_data_all
 OWNER TO op;
