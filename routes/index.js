const express      = require('express');
const router       = express.Router();
const sql          = require('../models/db');

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
  let today,
      currentDate,
      nextDate,
      prevDate;
  today = new Date();
  today = today.toLocaleDateString();
  if (req.query.date)
    currentDate = new Date(req.query.date);
  else {
    currentDate = new Date(today);
  }
  nextDate = new Date();
  nextDate.setDate(currentDate.getDate() + 1);
  prevDate = new Date();
  prevDate.setDate(currentDate.getDate() - 1);
  currentDate = currentDate.toLocaleDateString();
  nextDate = nextDate.toLocaleDateString();
  prevDate = prevDate.toLocaleDateString();
    sql.getUserTallies(req.user.UserId, currentDate, (err, results) => {
    let total = 0;
    for (let i = 0; i < results.length; i++) {
      list.push(results[i].Number);
      total += Number(results[i].Number);
    }
    res.render('index', { 
      tallies: list, 
      total: total,
      today: today,
      currentDate: currentDate,
      prevDate: prevDate,
      nextDate: nextDate
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