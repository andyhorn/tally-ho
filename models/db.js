const CREATE_USER_TABLE_QUERY = 'CREATE TABLE IF NOT EXISTS Users (UserId INTEGER AUTO_INCREMENT PRIMARY KEY, Username NVARCHAR(256), Name NVARCHAR(256), Hash NVARCHAR(512), Role NVARCHAR(64))';
const CREATE_TALLY_TABLE_QUERY = 'CREATE TABLE IF NOT EXISTS Tally (TallyId INTEGER AUTO_INCREMENT PRIMARY KEY, UserId INTEGER, Number INTEGER, Date VARCHAR(32))';
const USER_TALLIES_QUERY = 'SELECT * FROM Tally WHERE UserId = ? AND Date = ?';

const User = require('./user');
const mysql = require('mysql');
const bcrypt = require('bcrypt');

require('dotenv').config();

const connection = mysql.createPool({
    host : process.env.SQL_HOST,
    user : process.env.SQL_USER,
    password : process.env.SQL_PASSWORD,
    database : process.env.SQL_DATABASE
});

module.exports.init = () => {
    connection.query(CREATE_TALLY_TABLE_QUERY, (error, results, fields) => {
        if (error) throw error;
        else {
            console.log('Tally table initialized');
            console.log(results);
        }
    });
    connection.query(CREATE_USER_TABLE_QUERY, (error, results, fields) => {
        if (error) throw error;
        else {
            console.log('User table initialized');
            console.log(results);
        }
    });
}

module.exports.getUserTallies = function(userId, date, callback) {
    console.log('[getUserTallies] userId: ' + userId);
    console.log('[getUserTallies] date: ' + date);
    connection.query(USER_TALLIES_QUERY, [userId, date], (err, res, fields) => {
        callback(err, res);
    });
}

module.exports.addTally = function(number, userId, date, callback) {
    console.log('[addTally] Number: ' + number);
    console.log('[addTally] UserId: ' + userId);
    console.log('[addTally] Date: ' + date);
    connection.query('INSERT INTO Tally (Number, UserId, Date) VALUES (?,?,?)', [number, userId, date]
    , (err, results, fields) => {
        callback(err);
    });
}

module.exports.checkUsername = function(username, callback) {
    connection.query('SELECT SUM(UserId) FROM Users WHERE Username = ?', [username]
    , (err, results, fields) => {
        console.log(results);
        if (results[0] && results[0].SUM && Number(results[0].SUM) > 0)
            callback(true);
        else
            callback(false);
    });
}

module.exports.clearForUser = function(userId, date, callback) {
    connection.query('DELETE FROM Tally WHERE UserId = ? AND Date = ?', [userId, date],
    (err, results, fields) => {
        callback();
    });
}

module.exports.deleteUser = function(userId, callback) {
    connection.query('DELETE FROM Tally WHERE UserId = ?', [userId]);
    connection.query('DELETE FROM Users WHERE UserId = ?', [userId]);
    callback();
}

module.exports.updateUser = function(user, callback) {
    connection.query('UPDATE Users SET Name = ?, Username = ?, Role = ? WHERE UserId = ?',
    [user.Name, user.Username.toUpperCase(), user.Role, user.UserId]);
    if (user.Password) {
        User.genPassword(user.Password, (hash) => {
            connection.query('UPDATE Users SET Hash = ? WHERE UserId = ?', [hash, userId]);
        })
    }
    callback();
}

module.exports.getUserByUsername = function(username, callback) {
    connection.query('SELECT * FROM Users WHERE Username = ?', [username], (err, res, fields) => {
        if (err) throw err;
        else {
            console.log('[getUserByUsername] user:');
            console.log(res[0]);
            callback(err, res[0]);
        }
    });
}

module.exports.getUserById = function(id, callback) {
    connection.query('SELECT * FROM Users WHERE UserId = ?', [id], (err, res, fields) => {
        callback(err, res[0]);
    });
}

module.exports.createUser = function(newUser, callback) {
    console.log('[sql-CreateUser] creating new user');
    bcrypt.genSalt(12, (err, salt) => {
        console.log('[sql-CreateUser] bcrypt salt generated');
        bcrypt.hash(newUser.password, salt, (err, hash) => {
            console.log('[sql-CreateUser] password hashed');
            newUser.password = hash;
            connection.query('INSERT INTO Users (Username, Name, Hash, Role) VALUES (?,?,?,?)'
            , [newUser.username.toUpperCase(), newUser.name, newUser.password, newUser.role]
            , (err) => {
                console.log('[sql-CreateUser] user created');
                callback(err);
            });
        })
    })
}

module.exports.getAllUsers = function(callback) {
    connection.query('SELECT * FROM Users', (error, results, fields) => {
        console.log('[getAllUsers] error: ');
        console.log(error);
        console.log('[getAllUsers] results: ');
        console.log(results);
        callback(error, results);
    });
}