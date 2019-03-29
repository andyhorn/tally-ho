const express        = require('express');
const app            = express();
const router         = express.Router();
const db             = require('../models/sql');
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
  //if (req.user.role != 'Admin') res.redirect('/');
  //console.log('[adminPortal] user:')
  //console.log(req.user);
  let list = new Array();
  /*
  db.serialize(() => {
    db.each("SELECT * FROM Users;", (err, user) => {
      console.log(user);
      let newUser = {
        Name: user.Name,
        Id: user.UserId,
        Username: user.Username,
        Password: user.Hash,
        Role: user.Role
      };
      //console.log(newUser);
      list.push(newUser);
    }, (err, num) => {
      res.render('admin', { users: list, myId: req.user.UserId }); 
    });
  });
  */
  sql.getAllUsers((err, results) => {
    console.log('[admin-getAllUsers]');
    console.log(results);
    for (let u in results) {
      console.log(u);
      let newUser = {
        Name: u.name,
        Id: u.UserId,
        Username: u.Username,
        Password: u.Hash,
        Role: u.Role
      };
      list.push(newUser);
    }
    res.render('admin', { users: list, myId: req.user.UserId });
  });
});

router.get('/edit', ensureAdmin, (req, res) => {
  let userId = req.query.userId;
  //console.log('userId: ' + userId);
  /*
  User.getUserById(userId, (err, user) => {
    if (!err) {
      res.render('edit', { editUser: user }); 
    } else {
      req.flash('error_msg', 'Invalid user ID');
      res.redirect('/');
    }
  });
  */
  sql.getUserbyId(userId, (err, results, fields) => {
    if (!err) {
      res.render('edit', { editUser: results[0]});
    } else {
      req.flash('error_msg', 'Invalid user ID');
      res.redirect('/');
    }
  })
});

router.get('/delete', ensureAdmin, (req, res) => {
  let userId = req.query.userId;
  //console.log('deleting user ' + userId);
  /*
  db.deleteUser(userId, () => {
    res.redirect('/admin');
  });
  */
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
    /*
    db.updateUser(update, (err) => {
      if (err)
        res.flash('error_msg', err);
      res.redirect('/admin');
    });
    */
    sql.updateUser(update, (err) => {
      if (err)
        res.flash('error_msg', err);
      res.redirect('/admin');
    });
  }
});

module.exports = router;