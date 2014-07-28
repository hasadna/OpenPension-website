
//add new constraint to filter and reload page
function addConstraint(key, value) {

    //generate filter from query string
    var filter = Filter.fromQueryString(window.location.search);

    //add constraint from user
    filter.setConstraint(key, value);

    //convert filter back to query string, and apply location
    window.location.href = '/portfolio' + filter.toQueryString();
}