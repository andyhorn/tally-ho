const express        = require('express');
const app            = express();
const router         = express.Router();
const sql            = require('../models/db');
const User           = require('../models/user');

// Ensure the user is logged in and authenticated
function ensureAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user.Role == 'Admin') {
    return next(); 
  } else {
    res.redirect('/users/login'); 
  }
}

// Admin portal
router.get('/', ensureAdmin, (req, res) => {
  let list = new Array();
  sql.getAllUsers((err, results) => {
    //console.log('[admin-getAllUsers]');
    //console.log(results);
    //for (let u in results) {
    for (let i = 0; i < results.length; i++) {
      //console.log(results[i]);
      let newUser = {
        Name: results[i].name,
        Id: results[i].UserId,
        Username: results[i].Username,
        Password: results[i].Hash,
        Role: results[i].Role
      };
      list.push(newUser);
    }
    res.render('admin', { users: list, myId: req.user.UserId });
  });
});

router.get('/edit', ensureAdmin, (req, res) => {
  let userId = req.query.userId;
  sql.getUserById(userId, (err, user, fields) => {
    if (!err) {
      res.render('edit', { editUser: user});
    } else {
      req.flash('error_msg', 'Invalid user ID');
      res.redirect('/');
    }
  })
});

router.get('/delete', ensureAdmin, (req, res) => {
  let userId = req.query.userId;
  console.log('deleting user ' + userId);
  sql.deleteUser(userId, () => {
    res.redirect('/admin');
  })
});

router.post('/saveUser', ensureAdmin, (req, res) => {
  let username = req.body.username,
      name = req.body.name,
      role = req.body.role,
      password = req.body.password,
      userId = req.body.id;
  
  req.checkBody('username', 'Username is required').notEmpty();
  req.checkBody('name', 'Name is required').notEmpty();
  
  let errors = req.validationErrors();
  
  if (errors) {
    res.flash(errors); 
  } else {
    let update = {
      Username: username,
      Name: name,
      Role: role,
      UserId: userId,
      Password: password
    };
    sql.updateUser(update, (err) => {
      if (err)
        res.flash('error_msg', err);
      res.redirect('/admin');
    });
  }
});

module.exports = router;