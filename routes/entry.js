
/*
 * GET home page.
 */

exports.show = function(req, res){
  res.render('entry',{
  	entry: { title: "השקעות של הפניקס",total_value: "5.87 מיליארד ₪" },
  	elements: [
  		{name: "סוגי השקעות",
  		 bars: [{name: "אג\"ח קונצרני לא סחיר",
  				value: "2.8 מיליארד ₪",
  				percent: 33},
  				]
  	    }
	 ]});
};