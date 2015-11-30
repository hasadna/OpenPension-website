define(['Tabletop'],function(Tabletop) {
//TODO: use google spreadsheet service?
//or use direct csv link
//https://docs.google.com/spreadsheets/d/1tm2xjPUYUFPk3BeHSLXec3sSckGMlFROcoH2zZYQC20/export?format=json&id=1tm2xjPUYUFPk3BeHSLXec3sSckGMlFROcoH2zZYQC20&gid=596794202


	var GoogleDoc =  function(){};
	GoogleDoc.reader = function(){};

	var waitList = [];
	var mTabletop;
 	var sheetURL = 'https://docs.google.com/spreadsheets/d/1tm2xjPUYUFPk3BeHSLXec3sSckGMlFROcoH2zZYQC20/pubhtml?hl=en_US&hl=en_US';

	var tableTopOptions = {
	  key: sheetURL,
	  callback: onLoad,
	  simpleSheet: false
	};

	//callback function for tabletop initialization
	function onLoad(data, tabletop) {
		mTabletop = tabletop;
		waitList.forEach(function(func){
			func();
		})
	};

	GoogleDoc.init = function(){
		Tabletop.init(tableTopOptions);
	}

	GoogleDoc.getSpreadsheet = function(name, callback){

			if(callback){
				if (mTabletop != undefined){
					callback(null, mTabletop.sheets(name).all());
				}
				else{ //not initialized yet, queue
					waitList.push(this.getSpreadsheet.bind(this, name, callback));
				}
			}
	};

	//Help terms
	// GoogleDoc.getHelp('מטבעות',function(err, data){
	// 	data.forEach(function(currency){
	// 		dictionary[currency.currencyname.toLowerCase()] = currency.translation;
	// 	});
	// })

	GoogleDoc.init();

	
	return GoogleDoc;
});