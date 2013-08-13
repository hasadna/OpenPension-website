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
	        });    
	   	
    });
});

function addFilter(key,value){
	var url = window.location;
	var parameters = new Array();
	parameters[key] = value;
	location.href=buildUrl(url, parameters);
}

function buildUrl(url, parameters){
  var qs = "";
  for(var key in parameters) {
    var value = parameters[key];
    qs += encodeURIComponent(key) + "=" + encodeURIComponent(value) + "&";
  }
  if (qs.length > 0){
    qs = qs.substring(0, qs.length-1); //chop off last "&"
    if (url.toString().indexOf("?") > 0 )
    	url = url + "&" + qs;
    else
    	url = url + "?" + qs;
  }
  return url;
}
