const express      = require('express');
const router       = express.Router();
const User         = require('../models/user');
const passport     = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const sql           = require('../models/db');

// Register route
router.get('/register', (req, res) => {
  // Use pug to render the register page
  res.render('register');
});

// Login route
router.get('/login', (req, res) => {
  // use Pug to render the login page
  res.render('login');
});

// Register a new user
router.post('/register', (req, res) => {
  // Get all the user values
  let username = req.body.username,
      name = req.body.name,
      password = req.body.password;
  
  // Validation - use req.checkBody(param, error_msg).function() to perform validation
  req.checkBody('username', 'Username is required').notEmpty();
  req.checkBody('name', 'Name is required').notEmpty();
  req.checkBody('password', 'Password is required').notEmpty();
  req.checkBody('passwordConfirmation', 'Passwords must match').equals(req.body.password);
  
  // Get all the errors
  let errors = req.validationErrors();
  
  if (errors) {
    res.render('register', { errors: errors });
  } else {
    sql.checkUsername(username, (exists) => {
      console.log('No errors!');
      if (exists) {
        console.log('user already exists');
        req.flash('error_msg', 'Username already taken');
        res.redirect('/users/register');
      } else {
        console.log('user is new!');
        let role = 'User';
        if (username == 'admin')
          role = 'Admin';
        var newUser = {
          username: username.toUpperCase(),
          name: name,
          password: password,
          role: role
        };
        sql.createUser(newUser, (err) => {
          if (err) {
            console.log(err);
            req.flash('error_msg', 'There was an error registering.');
            res.redirect('/register');
          }
          else {
            req.flash('success_msg', 'You are now registered!');
            sql.getUserByUsername(username, (err, user) => {
              req.login(user, (err) => {return res.redirect('/');});
            });
          }
        });
      }
    });
  }
});

passport.use(new LocalStrategy((username, password, done) => {
  sql.getUserByUsername(username, (err, user) => {
    if (err) return done(err);
    if (!user) return done(null, false, { message: 'Invalid username' });
    User.comparePasswords(password, user.Hash, (err, isMatch) => {
      if (err) return done(err);
      if (!isMatch) return done(null, false, { message: 'Invalid password' });
      return done(null, user);
    });
  });
}));

passport.serializeUser((user, done) => {
  done(null, user.UserId);
});

passport.deserializeUser((id, done) => {
  sql.getUserById(id, (err, user) => {
    done(err, user);
  });
});

// Process a login
router.post('/login', passport.authenticate('local', {
    failureRedirect: '/users/login',
    failureFlash: true
}), (req, res) => {
  if (req.user.Role == 'Admin')
    res.redirect('../admin');
  else
    res.redirect('/');
});

// Process a logout
router.get('/logout', (req, res) => {
  req.flash('success_msg', 'You are logged out');
  req.logout();
  res.redirect('/users/login');
});

module.exports = router;