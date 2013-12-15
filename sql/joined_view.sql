CREATE OR REPLACE VIEW pension_data_all AS 
 SELECT 
    debug.managing_body,
    debug.fund,
    funds.fund_name,
    debug.report_year, 
    debug.report_qurater, 
    debug.instrument_type, 
    debug.instrument_sub_type, 
    debug.instrument_id,
    COALESCE(ext.instrument_name,debug.instrument_symbol) as instrument_name,
    ext.issuer, 
    COALESCE(ext.activity_industry,debug.industry) as activity_industry,
    debug.currency,     
    (COALESCE(debug.fair_value,0))*1000 as fair_value, 
    (COALESCE(debug.market_cap,0))*1000 as market_cap, 
    debug.rate_of_fund, 
    debug.rating_agency, 
    ext.reference_index, 
    debug.intrest_rate, 
    debug.date_of_purchase, 
    debug.average_of_duration, 
    debug.date_of_revaluation, 
    debug.rate, 
    debug.yield, 
    debug.rating, 
    debug.par_value,
    debug.tmp_name, 
    debug.underlying_asset, 
    debug.type_of_asset, 
    debug.rate_of_ipo 
   FROM debug
   LEFT JOIN ext ON (debug.instrument_id::text = ext.instrument_id::text)
   LEFT JOIN funds ON (debug.fund = funds.fund_id)
  WHERE (debug.instrument_id::text <> ''::text AND debug.instrument_id IS NOT NULL)
	and (debug.instrument_symbol::text <> ''::text AND debug.instrument_symbol IS NOT NULL);
