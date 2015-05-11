var Tabletop = require("tabletop");
var sheetURL = 'https://docs.google.com/spreadsheets/d/1tm2xjPUYUFPk3BeHSLXec3sSckGMlFROcoH2zZYQC20/pubhtml?hl=en_US&hl=en_US';

function reader(){

	this.tabletop;

	var tableTopOptions = {
	  key: sheetURL,
	  callback: onLoad,
	  simpleSheet: false
	};

	var self = this;
	var waitList = []; //callbacks waiting for init to finish

	//callback function for tabletop initialization
	function onLoad(data, tabletop) {
		self.tabletop = tabletop;
		waitList.forEach(function(func){
			func();
		})
	};

	this.init = function(){
		Tabletop.init(tableTopOptions);
	}

	this.getSpreadsheet = function(name, callback){

		if(callback){
			if (self.tabletop != undefined){
				callback(null, self.tabletop.sheets(name).all());
			}
			else{ //not initialized yet, queue
				waitList.push(self.getSpreadsheet.bind(this, name, callback));
			}
		}
	};

	this.init();
}

module.exports = {reader: new reader()};