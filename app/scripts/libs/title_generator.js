define(['Dictionary'],function(dictionary) {


	var translate = dictionary.translate;
	var TitleGenerator = function(){};
	
	TitleGenerator.createTitle = function(filter){
                                        
		  var title = "";
		  var firstInTitle ="";
		 
		  var onlyManagingBody = 0;
		  var onlyFundName = 0;
		  var nothingIsChosen = 0;
		  var addTheWordNechasim =0;
		  var instrumentNameIsChosen = 0;
		  var onlyIssuer = 0;
		  
		  var numberOfChosenFilters = 0; 
		  
		  var managing_body = translate(filter.getConstraintData('managing_body'));
		  var fund_name = filter.getConstraintData('fund_name');
		  var instrument_name = filter.getConstraintData('instrument_name');
		  var asset_type = filter.getConstraintData('asset_type');
		  var liquidity = filter.getConstraintData('liquidity');
		  var reference_index = filter.getConstraintData('reference_index');
		  var issuer = filter.getConstraintData('issuer');
		  var rating = filter.getConstraintData('rating');
		  var activity_industry = filter.getConstraintData('activity_industry');
		  var currency = filter.getConstraintData('currency');
		  var instrument_id = filter.getConstraintData('instrument_id');
		  var industry = filter.getConstraintData('industry');

		 
		  if (asset_type!="") {numberOfChosenFilters=numberOfChosenFilters+1; if (firstInTitle=="") {firstInTitle="asset_type";};};
		  if (reference_index!="") {numberOfChosenFilters=numberOfChosenFilters+1; if (firstInTitle=="") {firstInTitle="reference_index";};};
		  if (liquidity!="") {numberOfChosenFilters=numberOfChosenFilters+1; if (firstInTitle=="") {firstInTitle="liquidity";};};
		  if (issuer!="") {numberOfChosenFilters=numberOfChosenFilters+1; if (firstInTitle=="") {firstInTitle="issuer";};};
		  if (rating!="") {numberOfChosenFilters=numberOfChosenFilters+1; if (firstInTitle=="") {firstInTitle="rating";};};
		  if (activity_industry!="") {numberOfChosenFilters=numberOfChosenFilters+1; if (firstInTitle=="") {firstInTitle="activity_industry";};};
		  if (currency!="") {numberOfChosenFilters=numberOfChosenFilters+1; if (firstInTitle=="") {firstInTitle="currency";};};
		  
		  
		  
		  // nothing is chosen by the user
		  if (managing_body== "" && liquidity=="" && industry=="" && currency=="" && rating=="" && instrument_id==""  ) {
		        nothingIsChosen = 1; 
		  }  
		  // only managing body is active 
		  if (managing_body!= "" && filter.getDrillDownDepth() == 1 ) {
		        onlyManagingBody = 1; 
		  }
		  // only issuer is active 
		  if (issuer!="" && liquidity=="" && industry=="" && activity_industry=="" && currency=="" && rating=="" && asset_type=="" && instrument_id=="" && fund_name=="" && instrument_name=="") {
		        onlyIssuer = 1; 
		  }  
		  
		  
		  if (fund_name!= "" &&  filter.getDrillDownDepth() == 1 ||
		      fund_name!= "" && managing_body!= "" &&
		       filter.getDrillDownDepth() == 2 ) {
		        onlyFundName = 1; 
		  }
		  
		  // If managing body or instrument is not chosen add the word 'instruments' (nechasim) to have a NOSSE 
		  //if (managing_body== "" && liquidity=="" ) {
		  if (liquidity=="" && asset_type =="" && !onlyManagingBody) {
		        addTheWordNechasim = 1;  
		  }
		  

		  title +=  (managing_body != "")?onlyManagingBody? managing_body : managing_body + " <i class=\"fa fa-angle-left\"></i>  " : "שוק הפנסיה";
		  title +=  (instrument_name != "")? " " + instrument_name:"";

		  if (instrument_name=="") {
			  title+= (asset_type != "")?((firstInTitle=="asset_type")?((numberOfChosenFilters==1)? " ב" : "") : ((numberOfChosenFilters==1)? "" : " ב")) + asset_type + " " : "" ;
			  title+= (reference_index != "")?((firstInTitle=="reference_index")?((numberOfChosenFilters==1)? " ב" : "") : ((numberOfChosenFilters==1)? "" : " ב")) + "תעודות סל על מדד " + reference_index + " " : "" ;
			  title+= (liquidity != "")?((firstInTitle=="liquidity")?((numberOfChosenFilters==1)? " ב" : "") : ((numberOfChosenFilters==1)? "" : " ב")) + "רמת נזילות " + liquidity + " " : "" ;
			  title+= (issuer != "")?((firstInTitle=="issuer")?((numberOfChosenFilters==1)? "" : "") : ((numberOfChosenFilters==1)? "" : " של ")) + issuer + " " : "" ;
			  title+= (rating != "")?((firstInTitle=="rating")?((numberOfChosenFilters==1)? " ב" : "") : ((numberOfChosenFilters==1)? "" : " ב")) + "דירוג " + rating + " " : "" ;
			  title+= (activity_industry != "")?((firstInTitle=="activity_industry")?((numberOfChosenFilters==1)? " ב" : "") : ((numberOfChosenFilters==1)? "" : " ב")) + "ענף ה" + activity_industry + " " : "" ;
			  title+= (currency != "")?((firstInTitle=="currency")?((numberOfChosenFilters==1)? " ב" : "") : ((numberOfChosenFilters==1)? "" : " ב")) + translate(currency) + " " : "" ;
		  }

		  title = title.replace("null","לא נמצא בקטגוריה");

		  return title;  
	}



	TitleGenerator.getReportType = function(filter){
	  if (  (filter.getDrillDownDepth() == 0 ) || 
	        (filter.getDrillDownDepth() == 1 && filter.hasConstraint("managing_body")) ||
	        (filter.getDrillDownDepth() == 1 && filter.hasConstraint("fund_name")) ||
	        (filter.getDrillDownDepth() == 2 && 
	        filter.hasConstraint("managing_body") && 
	        filter.hasConstraint("fund_name"))
	        ){
	      return "managing_body";
	  }
	  else{
	    return "investment";
	  }

	}

	TitleGenerator.getReportTypeHeb = function(filter){
		var reportType = TitleGenerator.getReportType(filter);
		if (reportType =="managing_body"){
			return "תיק השקעות";
		}
		if (reportType == "investment"){
			return "השקעה";
		}

	}

	return TitleGenerator;

});
