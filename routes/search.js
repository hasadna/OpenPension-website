var _ = require('underscore');
var Filter = require('../core/filter.js');
var DAL = require('../core/dal.js');
var DataNormalizer = require('../core/data_normalizer.js');
var metaTable = require('../common/MetaTable').getMetaTable();
var translate = require('../core/dictionary.js').translate;
var config = require('../config')

exports.show = function(req, res){

    var searchTerm = req.query['q'];
    var page = req.query['p'];

    if (searchTerm == undefined){
        searchTerm = "";
    }

    DAL.search(searchTerm, page, function(err, result, query){

      console.log('TEST');
        res.render('search-results',{
          test: ["hello", "world"],

        });

    });

};

exports.results = function(req, res){
  res.render('search-results', {
    managingBodies: [
        {
          name: 'מגדל',
          url: '#'
        }
      ],
    funds: [
        {
          name: 'מגדל-אג"ח ופיקדונות 100%',
          url: '#'
        },
        {
          name: 'מגדל-אג"ח ופיקדונות מינימום 65%',
          url: '#'
        },
        {
          name: 'מגדל-אג"ח ופיקדונות מינימום 80%',
          url: '#'
        },
        {
          name: 'מגדל חדש-מסלול אג"ח ופקדונות 100%',
          url: '#'
        },
        {
          name: 'מגדל חדש-מסלול אג"ח ופקדונות מינימום 65%',
          url: '#'
        },
        {
          name: 'מגדל חדש-מסלול אג"ח ופקדונות מינימום 80%',
          url: '#'
        },
        {
          name: 'מגדל חדש-מסלול כללי עד 35%',
          url: '#'
        },
        {
          name: 'מגדל חדש-מסלול כללי עד 65%',
          url: '#'
        },
        {
          name: 'מגדל חדש- מסלול מט"ח מינימום 50%',
          url: '#'
        },
        {
          name: 'מגדל חדש- מסלול מט"ח מינימום 70%',
          url: '#'
        },
        {
          name: 'מגדל חדש - מסלול מנייתי',
          url: '#'
        },
        {
          name: 'מגדל - כללי 1 - קרן י\' החדשה',
          url: '#'
        },
        {
          name: 'מגדל-כללי 2',
          url: '#'
        },
        {
          name: 'מגדל-כללי 3',
          url: '#'
        },
        {
          name: 'מגדל לתגמולים ופיצויים',
          url: '#'
        },
        {
          name: 'מגדל-מסלול השקעה לפי הכשר',
          url: '#'
        },
        {
          name: 'מגדל- מסלול מט"ח מינימום 50%',
          url: '#'
        },
        {
          name: 'מגדל- מסלול מט"ח מינימום 70%',
          url: '#'
        },
        {
          name: 'מגדל - מסלול מנייתי',
          url: '#'
        },
        {
          name: 'מגדל-מרכזית לפיצויים',
          url: '#'
        },
        {
          name: 'מגדל פלטינום למעסיק',
          url: '#'
        },
        {
          name: 'מגדל פלטינום לתגמולים אג"ח ממשלתי',
          url: '#'
        },
        {
          name: 'מגדל פלטינום לתגמולים ביג כללי',
          url: '#'
        },
        {
          name: 'מגדל פלטינום לתגמולים חו"ל',
          url: '#'
        },
        {
          name: 'מגדל פלטינום לתגמולים כללי',
          url: '#'
        },
        {
          name: 'מגדל פלטינום לתגמולים מנייתי',
          url: '#'
        },
        {
          name: 'מגדל פלטינום לתגמולים צמוד מדד',
          url: '#'
        },
        {
          name: 'מגדל פלטינום לתגמולים שקלי קצר',
          url: '#'
        },
        {
          name: 'מגדל-קרן ח\'',
          url: '#'
        },
        {
          name: 'מגדל-קרן ט\'',
          url: '#'
        },
        {
          name: 'מגדל-קרן י\'',
          url: '#'
        }
      ],
    issuers: [
      {
        name: 'מגדל ביטוח הון',
        url: '#'
      },
      {
        name: 'מגדל בטוח',
        url: '#'
      }
    ],
    assets: [
      {
        name: 'מגדל ביטוח',
        url: '#'
      },
      {
        name: 'מגדל הון אג1מ',
        url: '#'
      },
      {
        name: 'מגדל הון אג2מ',
        url: '#'
      },
      {
        name: 'אגלס מגדל ביטוח מימון א 2012',
        url: '#'
      },
      {
        name: 'שה מגדל ביטוח סד ב 31.12.2012',
        url: '#'
      },
      {
        name: 'מגדלי ים התיכון',
        url: '#'
      },
      {
        name: 'מגדלי תיכון- מגדלי הים התיכון',
        url: '#'
      },
      {
        name: 'מגדלי תיכון מר- מגדלי הים התיכון',
        url: '#'
      },
      {
        name: 'הלוואות לחברים מגדל צמוד מדד 2635',
        url: '#'
      },
      {
        name: '*MTF תלבונד 40 קרן נאמנות- ומגדל קרנות נאמנות MTF',
        url: '#'
      },
      {
        name: '*MTF תל בונד 60 קרן- ומגדל קרנות נאמנות MTF',
        url: '#'
      },
      {
        name: 'מגדלי דיידלנד סד\' א 2012/2011 8',
        url: '#'
      },
      {
        name: 'חפציבה גרוזלם אגח א מגדל- חפציבה ג\'רוזלם גולד בעמ',
        url: '#'
      }
    ]
  });
}


