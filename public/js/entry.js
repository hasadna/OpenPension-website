$(function(){

    $('#select_group_by').selectpicker();

    $('#select_group_by').on('change', function() {
        setConstraint("group_by",this.value);

    });

});


//add new constraint to filter and reload page
function addConstraint(key,value){


  //TODO: remove this and implement
  //instrument_details 
  if($('#select_group_by option').length <= 1){
     alert("אין יותר חלוקות");
     return;
  }
  //generate filter from query string
  var filter = Filter.fromQueryString(window.location.search);

  //add constraint from user
  filter.addConstraint(key,value);

  var instrument_sub_type = filter.getConstraintData("instrument_sub_type")[0];
 
  //get next grouping category
  var group_by = Categories.getNextGroupingCategory(filter);

  if (group_by !== undefined){
    filter.setConstraint("group_by",group_by);
  }
  else{ //no group found for grouping
    filter.removeField("group_by");
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
