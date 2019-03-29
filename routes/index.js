const express      = require('express');
const router       = express.Router();
const db           = require('../models/sql');
const sql          = require('../models.db');

// Ensure the user is logged in and authenticated
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    //console.log('user is authenticated');
    return next(); 
  } else {
    //console.log('user is not authenticated');
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
  
  //console.log('today: ' + today);
  //console.log('currentDate: ' + currentDate);
  //console.log('nextDate: ' + nextDate);
  //console.log('prevDate: ' + prevDate);
  
  //db.getUserTallies(req.user.UserId, currentDate, (err, rows) => {
    sql.getUserTallies(req.user.UserId, currentDate, (err, results) => {
    //console.log('[getUserTallies] err:')
    //console.log(err);
    //console.log('[homepage] [userTallies] rows:');
    //console.log(rows);
    let total = 0;
    //for (let i = 0; i < rows.length; i++) {
    for (let i = 0; i < results.length; i++) {
      //console.log(rows[i]);
      list.push(rows[i].Number);
      total += Number(rows[i].Number);
    }
    //console.log(list);
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
  //let date = new Date().toLocaleDateString();
  let date = req.body.date;
  
  if (!Number(num)) {
    req.flash('error_msg', 'Invalid entry. Only numbers are allowed');
    res.redirect('/');
  } else {
    //console.log('[postTally] date: ' + date);
    //console.log('[postTally] userId: ' + userId);
    //console.log('[postTally] number: ' + num);
    //db.addTally(num, userId, date, (err) => {
    sql.addTally(num, userId, date, (err) => {
      if (err) {
        //console.log('[postTally] err:');
        //console.log(err);
      } else {
        //console.log('[postTally] success!');
        res.redirect('/?date=' + date);
      }
    });
  }
});

router.get('/clear', ensureAuthenticated, (req, res) => {
  let userId = req.user.UserId;
  let date = req.query.date;
  //console.log('[clearDate] userId: ' + userId);
  //console.log('[clearDate] date: ' + date);
  sql.clearForUser(userId, date, () => {
  //db.clearForUser(userId, date, () => {
    res.redirect('/?date=' + date);
  });
});

module.exports = router;