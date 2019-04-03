const SALT_ROUNDS = 12;
const bcrypt  = require('bcrypt');

module.exports.genPassword = (plainText, callback) => {
  bcrypt.genSalt(SALT_ROUNDS, (err, salt) => {
    bcrypt.hash(plainText, salt, (err, hash) => {
      callback(hash);
    });
  });
}

module.exports.comparePasswords = (candidate, hash, callback) => {
 bcrypt.compare(candidate, hash, (err, isMatch) => {
   callback(err, isMatch);
 });
}