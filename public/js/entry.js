$(function(){

    $('#select_group_by').selectpicker();

    $('#select_group_by').on('change', function() {
      setConstraint("group_by",this.value);
    });

});


//add new constraint to filter and reload page
function addConstraint(key,value){
  //generate filter from query string
  var filter = Filter.fromQueryString(window.location.search);

  //add constraint from user
  filter.addConstraint(key,value);

  //get next grouping category
  var group_by = Categories.getGroupingCategory("default",filter);

  filter.setConstraint("group_by",group_by);

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
