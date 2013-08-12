$(function(){
    /* add button, hide extra items*/      
    $('.bargraph').each(function() {
        var $list = $(this);
        var listSize = $list.children('.bargraph-entry').length;
       	if (listSize > 3 ){
	       	$list.append('<div class="bargraph-entry more_less"> <a class="bargraph-entry-name">הצג הכל</a><div class="bargraph-entry-value">...<div style="width: 0%;" class="bargraph-entry-bar"></div></div></div>')
	       	$list.find('.bargraph-entry:gt(2)').hide();
	       	$('.more_less').show();
	    }
    });

    /* button click handler*/
    $('.more_less').click(function() {
        var $btn = $(this);
        $btn.parent().find('.bargraph-entry:gt(2)').not('.more_less').slideToggle(400, 
        	function(){
	   					$btnname = $btn.children('.bargraph-entry-name');
				        $btnname.text($btnname.text() == 'הצג הכל' ? 'פחות' : 'הצג הכל');   
				        hasDoneOnce = true;
	        });    
	   	
    });
})