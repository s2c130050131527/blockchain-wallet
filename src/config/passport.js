import { Buffer } from 'buffer';

// config/passport.js

// load all the things we need
var LocalStrategy   = require('passport-local').Strategy;

// load up the user model
var mysql = require('mysql');
var bcrypt = require('bcrypt-nodejs');
var dbconfig = require('../mysql-database');
var connection = mysql.createConnection(dbconfig.connection);
var GoogleAuthenticator = require('passport-2fa-totp').GoogeAuthenticator;
var TwoFA = require('passport-2fa-totp').Strategy;
var totp = require('notp').totp;
var base32 = require('hi-base32');

connection.query('USE ' + dbconfig.database);
module.exports = function(passport) {


    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        connection.query("SELECT * FROM users WHERE id = ? ",[id], function(err, rows){
            done(err, rows[0]);
        });
    });

    passport.use(
        'local-signup',
        new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField : 'username',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, username, password, done) {
            // find a user whose email is the same as the forms email
            // we are checking to see if the user trying to login already exists
            connection.query("SELECT * FROM users WHERE username = ?",[username], function(err, rows) {
                console.log('coming here 1');
                console.log(err);
                if (err){
                    console.log(err);
                    return done(err);
                }
                if (rows.length) {
                    req.err ='Username Already Taken';
                    return done(null, req.err);
                } else {
                    var newUserMysql = {
                        username: username,
                        password: bcrypt.hashSync(password, null, null),
                        qrInfo:  GoogleAuthenticator.register(username),
                        twoFASetup: false
                    };

                    const imgCode = Buffer.from(newUserMysql.qrInfo.qr).toString('base64');

                    var insertQuery = "INSERT INTO users ( username, password,secret_text,svg_img,twofa_setup ) values (?,?,?,?,?)";

                    connection.query(insertQuery,[newUserMysql.username, newUserMysql.password,newUserMysql.qrInfo.secret,imgCode,newUserMysql.twoFASetup],function(err, rows) {
                        newUserMysql.id = rows.insertId;
                        return done(null, newUserMysql);
                    });
                }
            });
        })
    );

    passport.use(
        'local-login',
        new TwoFA({
            // by default, local strategy uses username and password, we will override with email
            usernameField : 'username',
            passwordField : 'password',
            codeField: 'authToken',
            passReqToCallback: true
        },
        function(req, username, password, done) { // callback with email and password from our form
            connection.query("SELECT * FROM users WHERE username = ?",[username], function(err, rows){
                if (err)
                    {
                    console.log(1);
                    req.err = 'Username or Password incorrect';
                    return done(err);
                    }
                if (!rows.length) {
                    console.log(2);
                    req.err = 'Username does not exist';
                    return done(null,req.err); // req.flash is the way to set flashdata using connect-flash
                }

                // if the user is found but the password is wrong
                if (!bcrypt.compareSync(password, rows[0].password)){
                    req.err = 'Password does not match';
                    return done(null, req.err); // create the loginMessage and save it to session as flashdata
                }

                if(!rows[0].twofa_setup){
                    req.err = 'Please complete Registration'
                    return done(null,req.err);
                }

                return done(null,rows[0])
            });
        },
        function(req,user,done){
            var secret = GoogleAuthenticator.decodeSecret(user.secret_text);
            done(null, secret,30);
        })
    );

    passport.use(
        'two-fa',
        new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
                usernameField: 'userId',
                passwordField: 'authCode',
            passReqToCallback: true
        },
        function(req, username,password, done) { 
            connection.query("SELECT * FROM users WHERE id = ?",[username], function(err, rows){
                console.log(1);
                if (err)
                    {
                    console.log(2);
                    req.err = 'Server Error';
                    return done(err);
                    }
                if (!rows.length) {
                    console.log(3);
                    req.err = 'Please Try Registration Again';
                    return done(null,req.err); // req.flash is the way to set flashdata using connect-flash
                }
                console.log(password,rows[0].username+ ' '+base32.decode(rows[0].secret_text,true));
                var isValid = totp.verify(password,base32.decode.asBytes(rows[0].secret_text));
                console.log(isValid);
                    if(!isValid){
                        console.log(3);
                        req.err = 'Auth Token Invalid';
                        return done(null, req.err);
                    }
                
                connection.query('UPDATE users set twofa_setup=true where id=?',[username],function(err,res){
                    return done(null, rows[0]);
                });
            });
        })
    );
};
