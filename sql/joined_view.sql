CREATE OR REPLACE VIEW pension_data_all AS 
 SELECT 
    dev1.managing_body,
    dev1.fund,
    funds.fund_name,
    dev1.report_year, 
    dev1.report_qurater, 
    dev1.instrument_type, 
    dev1.instrument_sub_type, 
    dev1.instrument_id,
    case 	when dev1.instrument_sub_type in ('חוזים עתידיים', 'אופציות')	then dev1.instrument_sub_type
		else COALESCE(ext.instrument_name,dev1.instrument_symbol,dev1.instrument_id)
    end					as instrument_name,
    
--    (dev1.instrument_id || ' - '::character varying(128) || (COALESCE(ext.instrument_name,dev1.instrument_symbol)))::character varying(128) as instrument_name,
    ext.issuer, 
    case 	when dev1.instrument_sub_type like '%מניות%' 		then COALESCE(ext.activity_industry,dev1.industry,'אחר'::character varying(128))
		when dev1.instrument_sub_type like '%קונצרני%' 		then COALESCE(ext.activity_industry,dev1.industry,'אחר'::character varying(128))
		when dev1.instrument_sub_type like '%כתבי אופציה%' 	then COALESCE(ext.activity_industry,dev1.industry,'אחר'::character varying(128))
		when dev1.instrument_sub_type like '%תעודות סל%' 	then COALESCE(ext.activity_industry,dev1.industry,'לא רלוונטי'::character varying(128))
		when dev1.instrument_sub_type like '%קרנות%' 		then 'אחר'::character varying(128)
		when dev1.instrument_type     like '%הלוואות%' 		then 'אחר'::character varying(128)
		when dev1.instrument_sub_type like '%ממשלתיות%'		then 'לא רלוונטי'::character varying(128)
		when dev1.instrument_sub_type in ('חוזים עתידיים', 'מוצרים מובנים', 'אופציות')	then 'לא רלוונטי'::character varying(128)
		when dev1.instrument_type in ('מזומנים','פקדונות')	then 'לא רלוונטי'::character varying(128)
		else 							     'לא רלוונטי'::character varying(128)
    end					as activity_industry,
    dev1.currency,     
    (COALESCE(dev1.fair_value,0))*1000 	as fair_value, 
    (COALESCE(dev1.market_cap,0))*1000 	as market_cap, 
    dev1.rate_of_fund, 
    dev1.rating_agency, 
    ext.reference_index, 
    dev1.intrest_rate, 
    dev1.date_of_purchase, 
    dev1.average_of_duration, 
    dev1.date_of_revaluation, 
    dev1.rate,
    dev1.yield, 
    case	when dev1.rating_agency = 'פנימי' 			then 'פנימי'::character varying(128)
		when dev1.rating = 'Aaa' 				then 'AAA'::character varying(128)
		when dev1.rating = 'Aa1' 				then 'AA+'::character varying(128)
		when dev1.rating = 'Aa2' 				then 'AA'::character varying(128)
		when dev1.rating = 'Aa3' 				then 'AA-'::character varying(128)
		when dev1.rating = 'A1' 				then 'A+'::character varying(128)
		when dev1.rating = 'A2' 				then 'A'::character varying(128)
		when dev1.rating = 'A3' 				then 'A-'::character varying(128)
		when dev1.rating = 'Baa1' 				then 'BBB+'::character varying(128)
		when dev1.rating = 'Baa2' 				then 'BBB'::character varying(128)
		when dev1.rating = 'Baa3' 				then 'BBB-'::character varying(128)
		when dev1.rating = 'Ba1' 				then 'BB+'::character varying(128)
		when dev1.rating = 'Ba2' 				then 'BB'::character varying(128)
		when dev1.rating = 'Ba3' 				then 'BB-'::character varying(128)
		when dev1.rating = 'B1' 				then 'B+'::character varying(128)
		when dev1.rating = 'B2' 				then 'B'::character varying(128)
		when dev1.rating = 'B3' 				then 'B-'::character varying(128)
		when dev1.rating = 'Caa' 				then 'CCC+'::character varying(128)
		when dev1.rating = 'Caa2' 				then 'CCC'::character varying(128)
		when dev1.rating = 'Ca' 				then 'CCC'::character varying(128)
		when dev1.rating = 'C' 					then 'CCC-'::character varying(128)
		when dev1.rating = 'RF' 				then 'AAA'::character varying(128)
		when dev1.rating = 'NR' 				then 'לא מדורג'::character varying(128)
		else 							     dev1.rating
    end 				as rating, 
    dev1.par_value,
    dev1.tmp_name, 
    dev1.underlying_asset, 
    dev1.type_of_asset, 
    dev1.rate_of_ipo 
   FROM dev1
   LEFT JOIN ext ON (dev1.instrument_id::text = ext.instrument_id::text)
   LEFT JOIN funds ON (dev1.fund = funds.fund_id)
  WHERE (dev1.instrument_id::text <> ''::text AND dev1.instrument_id IS NOT NULL)
	and (dev1.instrument_symbol::text <> ''::text AND dev1.instrument_symbol IS NOT NULL);

ALTER TABLE pension_data_all
 OWNER TO oprw;
