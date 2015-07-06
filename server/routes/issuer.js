var _ = require('underscore');
var DAL = require('../core/dal.js');
var Filter = require('../core/filter.js');
var async = require('async');
var config = require('../config');
var squel = require('squel');
var db = require('../core/db.js');

exports.fetch = function(req, res) {
  log('issuer.fetch');
  getIssuerDataTable(
      Filter.fromGetRequest(req),
      function(rows) {
        res.json(rows);
      },
      function(err) {
        // TODO: handle error.
        log('Failed getting rate of IPO data: ' + err)
      });
};

/**
 * Gets the data table for the rate of IPO page and calls the success or error
 * handler.
 */
function getIssuerDataTable(filter, success, error) {
  log('filter: ' + JSON.stringify(filter));
  var issuer = filter.getConstraintData("issuer")[0];
  var currentYear = filter.getConstraintData("report_year")[0];
  var currentQuarter = filter.getConstraintData("report_qurater")[0];

  log('issuer: ' + issuer);
  log('currentYear: ' + currentYear);
  log('currentQuarter: ' + currentQuarter);
  // Build queries.

  // Sum of par value, grouped by managing body over the last 4 quarters.
  var sumParValueQuery = squel.select()
      .field('report_year')
      .field('report_qurater')
      .field('managing_body')
      .field('SUM(par_value)', 'total_par_value')
      .field('SUM(fair_value)', 'total_fair_value')
      .from(config.table)
      .where('rate_of_ipo IS NOT NULL')
      .where('issuer=?', issuer)
      .group('report_year')
      .group('report_qurater')
      .group('managing_body');
  DAL.addLastQuartersToQuery(
    sumParValueQuery, currentYear, currentQuarter, 4 /* numQuarters */);

  // Total issued for the current issuer.
  var totalIssuedQuery = squel.select()
      .field('SUM(max_total_issued)', 'sum_total_issued')
      .from('total_issued_per_instrument')
      .where('issuer=?', issuer);

  // Sum of fair value, grouped by managing body, for the current quarter only.
  var sumFairValueQuery = squel.select()
      .field('managing_body')
      .field('SUM(fair_value)', 'total_fair_value')
      .from(config.table)
      .where('issuer=?', issuer)
      .where('report_year=?', currentYear)
      .where('report_qurater=?', currentQuarter)
      .group('managing_body');

  // Issue query.
  async.parallel([
      _.partial(executeQuery, sumParValueQuery.toString()),
      _.partial(executeQuery, totalIssuedQuery.toString()),
      _.partial(executeQuery, sumFairValueQuery.toString())],
      function(asyncError, results) {
        if (asyncError) {
         error('Error when executing queries: ' + asyncError.message);
         return;
        }
        try {
          var table = createTableResponse(results);
          if (table == null) {
            error('Invalid data was from DB.');
          }
          success(table);
        } catch (e) {
          error('Exception thrown in createTableResponse: ' + e.message);
        }
      });
}

function createTableResponse(results) {
  if (!results) {
    log('Invalid results: ' + results);
    return null;
  }
  if (results.length < 3) {
    log('Invalid results: ' + JSON.stringify(results));
    return null;
  }
  if (results[1].length == 0) {
    log('Invalid results[1]: ' + JSON.stringify(results[1]));
    return null;
  }

  // Divide total_par_value by sum_total_issued.
  var sumParValueRows = results[0];
  var sumTotalIssued = results[1][0]['sum_total_issued'];
  var sumFairValueRows = results[2];

  // Group by managing_body.
  var quartersGroupedByManagingBody = _.groupBy(sumParValueRows, function(row) {
    return row['managing_body'];
  });

  var fairValueByManagingBody = _.groupBy(sumFairValueRows, function(row) {
    return row['managing_body'];
  });

  // Sum fair value over all managing bodies.
  var totalFairValue = 0;
  _.each(sumFairValueRows, function(row) {
    totalFairValue += Number(row['total_fair_value']);
  });

  // Map to table rows.
  var rows =  _.map(quartersGroupedByManagingBody, function(dataPerQuarter, managingBody) {
    var fairValue = 0;
    if (!_.isUndefined(fairValueByManagingBody[managingBody])) {
     fairValue =
        Number(fairValueByManagingBody[managingBody][0]['total_fair_value']);
    }
    return {
      key: managingBody,
      values: [
        Number(dataPerQuarter[0]['total_par_value']) / sumTotalIssued * 100,
        Number(dataPerQuarter[1]['total_par_value']) / sumTotalIssued * 100,
        Number(dataPerQuarter[2]['total_par_value']) / sumTotalIssued * 100,
        Number(dataPerQuarter[3]['total_par_value']) / sumTotalIssued * 100,
        fairValue / totalFairValue,
        fairValue
      ]
    };
  });

  // Sort rows by the first column in descending order.
  return _.sortBy(rows, function(row) {
    return -row.values[0];
  });
}

function executeQuery(queryString, callback) {
  db.query(queryString, function(err, rows) {
    if (err) {
      callback(err, null);
      return;
    }
    callback(null, rows);
  }, true /* bypassMemcache */);
}

function log(message) {
  console.log(message);
}
