const express       = require('express');
const router        = express.Router();
const sql           = require('../models/db');
const moment        = require('moment');

// Ensure the user is logged in and authenticated
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next(); 
  } else {
    res.redirect('/users/login'); 
  }
}

// Get the homepage
router.get('/', ensureAuthenticated, (req, res) => {
  let list = new Array();
  let dates = getDates(req.query.date);

  sql.getUserTallies(req.user.UserId, dates.viewDate, (err, results) => {
    if (err) {
      req.flash('error_msg', 'There was an error retrieving data.');
      res.redirect('/');
    }
    let total = 0;
    for (let i = 0; i < results.length; i++) {
      list.push(results[i].Number);
      total += Number(results[i].Number);
    }
    res.render('index', { 
      tallies: list, 
      total: total,
      today: dates.today,
      viewDate: dates.viewDate,
      previousDate: dates.previousDate,
      nextDate: dates.nextDate
    });
  });
});

router.post('/postTally', ensureAuthenticated, (req, res) => {
  let userId = req.user.UserId;
  let num = req.body.number;
  let date = req.body.date;
  if (!Number(num)) {
    req.flash('error_msg', 'Invalid entry. Only numbers are allowed');
    res.redirect('/');
  } else {
    sql.addTally(num, userId, date, (err) => {
      res.redirect('/?date=' + date);
    });
  }
});

router.get('/clear', ensureAuthenticated, (req, res) => {
  let userId = req.user.UserId;
  let date = req.query.date;
  sql.clearForUser(userId, date, () => {
    res.redirect('/?date=' + date);
  });
});

module.exports = router;

function getDates(query) {
  console.log('creating date object...');
  let dateObject = {},
      today = moment(),
      viewDate = query != null ? moment(query, 'M/D/YYYY') : today.clone(),
      nextDate = viewDate.clone().add(1, 'd'),
      previousDate = viewDate.clone().subtract(1, 'd');

  dateObject.today = today.format('M/D/YYYY');
  dateObject.nextDate = nextDate.format('M/D/YYYY');
  dateObject.previousDate = previousDate.format('M/D/YYYY');
  dateObject.viewDate = viewDate.format('M/D/YYYY');

  console.log('done!');
  for(let key in dateObject)
    console.log(`${key}: ${dateObject[key]}`);
  return dateObject;
}