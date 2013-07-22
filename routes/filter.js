module.exports = function Filter(){
    this.filters = {};

	this.addFilter = function (field, value){
	    if (!this.filters.hasOwnProperty(field)){
	      this.filters[field] = [];       
	    }

		this.filters[field].push({"data": value }) ;    
	   
	}
    
	this.toString = function(){
		return JSON.stringify(this);
	}
}