const express        = require('express');
const expressValidator = require('express-validator');
const bodyParser     = require('body-parser');
const cookieParser   = require('cookie-parser');
const path           = require('path');
const flash          = require('connect-flash');
const app            = express();
const pug            = require('pug');
const passport       = require('passport');
const session        = require('express-session');
const sqliteStore    = require('connect-sqlite3')(session);
const LocalStrategy  = require('passport-local');
const http           = require('http');
const dotenv	       = require('dotenv').config()

const routes         = require('./routes/index');
const users          = require('./routes/users');
const admin          = require('./routes/admin');

// Static routes
app.use(express.static(__dirname + '/public'));

// View engine and controls
app.set('views', path.join(__dirname, 'views/'));
app.set('view engine', 'pug');

// Setup middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(flash());

app.use(session({
  store: new sqliteStore, // long term storage of session cookies in a sqlite db
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000 // one week maximum age
  }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(expressValidator({
  errorFormatter: (param, msg, value) => {
    let namespace = param.split('.'),
        root = namespace.shift(),
        formParam = root;
    
    while (namespace.length) {
      formParam += '[' + namespace.shift() + ']'; 
    }
    
    return {
      param: formParam,
      msg: msg,
      value: value
    };
  }
}));

// Enable global variables for message flashing
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});

app.use('/', routes);
app.use('/users', users);
app.use('/admin', admin);

function timify(hour, min, sec) {
  let time = '';
  if (hour < 10)
    time += '0';
  time += hour + ':';
  if (min < 10)
    time += '0';
  time += min + ':';
  if (sec < 10)
    time += '0';
  time += sec;
  return time;
}

app.get('/wake', (req, res) => {
  console.log('woken up!');
  res.sendStatus(200);
});

app.get('*', (req, res) => {
  res.render('not-found');
});

require('./models/db').init();

// listen for requests :)
var listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});
