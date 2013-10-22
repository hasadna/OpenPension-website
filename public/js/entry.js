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

    var filter = Filter.fromQueryString(window.location.search);

    $('#select_group_by').on('change', function() {
      setConstraint("group_by",this.value);
    });

});


function addConstraint(key,value){
  //generate filter from query string
  var filter = Filter.fromQueryString(window.location.search);

  //add constraint from user
  filter.addConstraint(key,value);

  var group_by = Categories.getGroupingCategory("default",filter);

  if(typeof group_by == "undefined"){
    filter.removeField("group_by");
  }
  else{
    filter.setConstraint("group_by",group_by);
  }

  //convert filter back to query string, and apply location
  window.location.href = filter.toQueryString();
}


function setConstraint(key,value){
  //generate filter from query string
  var filter = Filter.fromQueryString(window.location.search);

  //add constraint from user
  filter.setConstraint(key,value);

  //convert filter back to query string, and apply location
  window.location.href = filter.toQueryString();

}
