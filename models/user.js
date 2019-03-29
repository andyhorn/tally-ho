const SALT_ROUNDS = 10;
const INSERT_USER_QUERY = "INSERT INTO Users (Username, Name, Hash, Role) VALUES (?, ?, ?, ?)";
const FIND_USERNAME_QUERY = "SELECT * FROM Users WHERE Username = ?";
const FIND_USER_ID_QUERY = "SELECT * FROM Users WHERE UserId = ?";

//const db      = require('./sql');
const sql     = require('./db');
const bcrypt  = require('bcrypt');

/*
module.exports.createUser = (newUser, callback) => {
   bcrypt.genSalt(SALT_ROUNDS, (err, salt) => {
     bcrypt.hash(newUser.password, salt, (err, hash) => {
       newUser.password = hash;
       //db.run(INSERT_USER_QUERY, newUser.username.toUpperCase(), newUser.name, newUser.password, newUser.role, (err) => {
         callback(err);
       });
     });
   });
}
*/

module.exports.genPassword = (plainText, callback) => {
  bcrypt.genSalt(SALT_ROUNDS, (err, salt) => {
    bcrypt.hash(plainText, salt, (err, hash) => {
      callback(hash);
    });
  });
}

/*
module.exports.getUserByUsername = (username, callback) => {
  console.log('[getUserByUsername] finding user ' + username.toUpperCase());
  db.get(FIND_USERNAME_QUERY, username.toUpperCase(), (err, user) => {
    console.log('[getUserByUsername] err: ');
    console.log(err);
    console.log('[getUserByUsername] user: ');
    console.log(user);
    callback(err, user);
  });
}
*/
/*
module.exports.getUserById = (id, callback) => {
 db.get(FIND_USER_ID_QUERY, id, (err, user) => {
   callback(err, user);
 });
}
*/

module.exports.comparePasswords = (candidate, hash, callback) => {
 bcrypt.compare(candidate, hash, (err, isMatch) => {
   callback(err, isMatch);
 });
}