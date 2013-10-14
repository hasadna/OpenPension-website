$(function(){

    var VISIBLE_ITEMS = 3;
    /* add button, hide extra items*/      
    $('.bargraph').each(function() {
        var $list = $(this);
        var listSize = $list.children('.bargraph-entry').length;
       	if (listSize > VISIBLE_ITEMS ){
	       	$list.append('<div class="bargraph-entry more_less"> <a class="bargraph-entry-name">הצג הכל</a><div class="bargraph-entry-value">...<div style="width: 0%;" class="bargraph-entry-bar"></div></div></div>')
	       	$list.find('.bargraph-entry:gt('+VISIBLE_ITEMS+')').hide();
	       	$('.more_less').show();
	    }
    });

    /* button click handler*/
    $('.more_less').click(function() {
        var $btn = $(this);
        $btn.parent().find('.bargraph-entry:gt('+VISIBLE_ITEMS+')').not('.more_less').slideToggle(400, 
        	function(){
				$btnname = $btn.children('.bargraph-entry-name');
				$btnname.text($btnname.text() == 'הצג הכל' ? 'פחות' : 'הצג הכל');   
	        });    
	   	
    });

 

});


var all_categories = {
                      'default' : 
                        [
                        'managing_body', 
                        'instrument_type', 
                        'industry', 
                        'currency', 
                        'rating', 
                        'instrument_sub_type' , 
                        'report_year', 
                        'report_qurater',  
                        'instrument_id'
                        ]
                      };



/*
 * Look for a category which is not in filter constraints
 */
function getGroupingCategory(instrument_id, filter){

  var constrainedFields = filter.getConstrainedFields();

  //iterate over categories
  for(categoryIndex in all_categories[instrument_id]){
    var category = all_categories[instrument_id][categoryIndex];
    //if category equals constrained fields
    //OR 
    //constrained fields is array AND
    //constrained fileds contains category    
    if( category == constrainedFields ||  
      Object.prototype.toString.call( constrainedFields ) === '[object Array]' && 
      constrainedFields.indexOf(category) != -1){ 
      continue;
    }
    else{
      return all_categories[instrument_id][categoryIndex];
    }
  }

}


function addConstraint(key,value){
  var filter = Filter.fromQueryString(window.location.search);
  filter.addConstraint(key,value);

  window.location.href = filter.toQueryString();
}



