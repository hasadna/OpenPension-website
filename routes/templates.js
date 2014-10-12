var fs = require('fs');
var jade = require('jade');

//PORTFOLIO
var fundsCode = fs.readFileSync("views/partials/funds.jade","utf-8").toString();
var fundsTemplate = jade.compileClient(fundsCode, {});

var groupsCode = fs.readFileSync("views/partials/groups.jade","utf-8").toString();
var groupsTemplate = jade.compileClient(groupsCode, {});

var breadcrumbsCode = fs.readFileSync("views/partials/breadcrumbs.jade","utf-8").toString();
var breadcrumbsTemplate = jade.compileClient(breadcrumbsCode, {});

var reportTitleCode = fs.readFileSync("views/partials/report_title.jade","utf-8").toString();
var reportTitleTemplate = jade.compileClient(reportTitleCode, {});

var headerCode = fs.readFileSync("views/partials/header.jade","utf-8").toString();
var headerTemplate = jade.compileClient(headerCode, {});

var Templates = {};

Templates.fundsTemplate = fundsTemplate;
Templates.groupsTemplate = groupsTemplate;
Templates.breadcrumbsTemplate = breadcrumbsTemplate;
Templates.reportTitleTemplate = reportTitleTemplate;
Templates.headerTemplate = headerTemplate;

exports.Templates = Templates;