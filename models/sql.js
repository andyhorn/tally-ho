const USER_TABLE_SQL = "CREATE TABLE Users (UserId INTEGER PRIMARY KEY, Username TEXT NOT NULL, Name TEXT NOT NULL, Hash TEXT NOT NULL, Role TEXT);";
const TALLY_TABLE_SQL = "CREATE TABLE Tally (TallyId INTEGER PRIMARY KEY, UserId INTEGER NOT NULL, Number INTEGER NOT NULL, Date TEXT NOT NULL);";
const USER_TALLY_QUERY = "SELECT * From Tally WHERE UserId = ? AND Date = ?";

// init sqlite db
const fs = require('fs');
const dbFile = './.data/sqlite.db';
const exists = fs.existsSync(dbFile);
const sqlite3 = require('sqlite3').verbose();
const db = module.exports = new sqlite3.Database(dbFile);
const User = require('./user');

// if ./.data/sqlite.db does not exist, create it, otherwise print records to console
db.serialize(function(){
  if (!exists) {
    db.serialize(() => {
      db.run(USER_TABLE_SQL, (err) => console.log(err) );
      db.run(TALLY_TABLE_SQL, (err) => console.log(err) );
    });
  }
});

module.exports.resetDatabase = function(callback) {
  db.serialize(() => {
    db.run('DROP TABLE Tally', (err) => {
      if (err)
        console.log(err);
      else
        console.log('Tally table dropped');
    });
    db.run('DROP TABLE Users', (err) => {
      if (err)
        console.log(err);
      else
        console.log('Users table dropped');
    });
    db.run(USER_TABLE_SQL, (err) => {
      if (err)
        console.log(err);
      else
        console.log('Users table created');
    });
    db.run(TALLY_TABLE_SQL, (err) => {
      if (err)
        console.log(err);
      else
        console.log('Tally table created');
    });
  });
}

module.exports.getUserTallies = function(userId, date, callback) {
  console.log('[getUserTallies] userId: ' + userId);
  console.log('[getUserTallies] date: ' + date);
  console.log('[getUserTallies] query: ' + USER_TALLY_QUERY);
  db.all(USER_TALLY_QUERY, userId, date, (err, rows) => {
    callback(err, rows);
  });
}

module.exports.addTally = function(number, userId, date, callback) {
  console.log('[addTally] Number: ' + number);
  console.log('[addTally] UserId: ' + userId);
  console.log('[addTally] Date: ' + date);
  db.run("INSERT INTO Tally (Number, UserId, Date) VALUES (?,?,?)", number, userId, date, (err, rows) => {
    callback(err);
  });
}

module.exports.checkUsername = function(username, callback) {
  console.log('[checkUsername] username: ' + username);
  db.get("SELECT SUM(UserId) FROM Users WHERE Username = ?", username, (err, num) => {
    console.log(err);
    console.log('[checkUsername] result:');
    console.log(num);
    let result = Number(num['SUM(UserId)']);
    console.log(result);
    if (result && result > 0)
      callback(true);
    else
      callback(false);
  });
}

module.exports.clearForUser = function(userId, date, callback) {
  console.log('[clearForUser] userId: ' + userId);
  console.log('[clearForUser] date: ' + date);
  db.run("DELETE FROM Tally WHERE UserId = ? AND Date = ?", userId, date, (err) => {
    callback();
  });
}

module.exports.deleteUser = function(userId, callback) {
  db.serialize(() => {
    db.run('DELETE FROM Tally WHERE UserId = ?', userId);
    db.run('DELETE FROM Users WHERE UserId = ?', userId);
    callback();
  });
}

module.exports.updateUser = function(user, callback) {
  let newName = user.Name,
      newUsername = user.Username.toUpperCase(),
      newRole = user.Role,
      userId = user.UserId,
      newPassword = user.Password || null;
  
  db.serialize(() => {
    db.run("UPDATE Users SET Name = ?, Username = ?, Role = ? WHERE UserId = ?",
           newName, newUsername, newRole, userId, (err) => console.log(err));
    if (newPassword) {
      User.genPassword(newPassword, (hash) => {
        db.run('UPDATE Users SET Hash = ? WHERE UserId = ?',
               hash, userId, (err) => console.log(err));
      });
    }
    callback();
  });
}