$(function(){
  
  $("#search_text").keyup(function(event){
      if(event.keyCode == 13){
        search($("#search_text").val());
      }
  });

  $("#search_btn").click(function(event){
          search($("#search_text").val());
    });

});

function search(q){
  window.location = "/search?q="+q;
}