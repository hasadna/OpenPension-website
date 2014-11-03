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
-- -----------------------------------------------------------------------
-- issuer - in case of תעודות התחייבות ממשלתיות the ussuer is ממשלת ישראל
-- -----------------------------------------------------------------------
    case        when production.instrument_sub_type like '%ממשלתיות%' and production.currency = 'NIS'		then 'ממשלת ישראל'::character varying(128)
		else ext.issuer 
    end 				as issuer, 
-- -----------------------------------------------------------------------
-- activity_industry (ענף פעילות) - null -> in case of מזומן,פקדונות,ממשלתיות, תעודות סל, חוזים עתידיים, מוצרים מובנים, הלוואות וזכויות מקרקעין     
-- -----------------------------------------------------------------------
    case 	when production.instrument_sub_type like '%מניות%' 		then COALESCE(ext.activity_industry,production.industry,'אחר'::character varying(128))
		when production.instrument_sub_type like '%קונצרני%' 		then COALESCE(ext.activity_industry,production.industry,'אחר'::character varying(128))
		when production.instrument_sub_type like '%תעודות חוב%' 	then COALESCE(ext.activity_industry,production.industry,'אחר'::character varying(128))
		when production.instrument_sub_type like '%תעודות התחייבות מסחריות%' 	then COALESCE(ext.activity_industry,production.industry,'אחר'::character varying(128))
		when production.instrument_sub_type like '%כתבי אופציה%' 	then COALESCE(ext.activity_industry,production.industry,'אחר'::character varying(128))
		when production.instrument_sub_type like '%תעודות סל%' 		then COALESCE(ext.activity_industry,production.industry,NULL::character varying(128))
		when production.instrument_sub_type like '%קרנות%' 		then 'אחר'::character varying(128)
		when production.instrument_type     like '%הלוואות%' 		then NULL::character varying(128)
		when production.instrument_type     like '%זכויות מקרקעין%' 	then NULL::character varying(128)
		when production.instrument_sub_type like '%ממשלתיות%'		then NULL::character varying(128)
		when production.instrument_sub_type in ('חוזים עתידיים', 'מוצרים מובנים', 'אופציות')	then NULL::character varying(128)
		when production.instrument_type in ('מזומנים','פקדונות')	then NULL::character varying(128)
		else 							     'לא מסווג'::character varying(128)
    end					as activity_industry,
--    production.currency,     
-- -----------------------------------------------------------------------
-- currency (מטבע) - can not be null    
-- -----------------------------------------------------------------------
    COALESCE(production.currency,'NIS'::character varying(128)) 	as currency,     
    (COALESCE(production.fair_value,0))*1000+(COALESCE(production.market_cap,0))*1000 	as fair_value, 
    0::numeric 	as market_cap, 
    production.rate_of_fund, 
    production.rating_agency, 
    ext.reference_index, 
    production.intrest_rate, 
    production.date_of_purchase, 
    production.average_of_duration, 
    production.date_of_revaluation, 
-- -----------------------------------------------------------------------
-- rate (דירוג) - not null - ממשלתיות, אגח קונצרני, תעודות חוב מסחריות, קרנות נאמנות, מוצרים מובנים, תעודות התחייבות מסחריות, הלוואות
-- -----------------------------------------------------------------------
--    case 	when production.instrument_sub_type like '%ממשלתיות%'		then production.rate::character varying(128)
--		when production.instrument_sub_type like '%קונצרני%' 		then production.rate::character varying(128)
--		when production.instrument_sub_type like '%תעודות חוב%' 	then production.rate::character varying(128)
--		when production.instrument_sub_type like '%קרנות%' 		then production.rate::character varying(128)
--		when production.instrument_sub_type like '%תעודות התחייבות מסחריות%' 	then production.rate::character varying(128)
--		when production.instrument_type     like '%הלוואות%' 		then production.rate::character varying(128)
--		when production.instrument_sub_type in ( 'מוצרים מובנים')	then production.rate::character varying(128)
--		else 							     	NULL::character varying(128)
--    end					as rate,
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
-- -----------------------------------------------------------------------
-- liquidity - null -> in case of קרנות השקעה     
-- -----------------------------------------------------------------------
    case        when production.instrument_sub_type like '%קרנות%' 		then NULL::character varying(128)
		else liquidity.liquidity
    end 				as liquidity,
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
