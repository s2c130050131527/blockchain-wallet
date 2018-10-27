import { Buffer } from 'buffer';

// config/passport.js

// load all the things we need
var LocalStrategy   = require('passport-local').Strategy;

// load up the user model
var mysql = require('mysql');
var bcrypt = require('bcrypt-nodejs');
var dbconfig = require('../mysql-database');
var connection;
var GoogleAuthenticator = require('passport-2fa-totp').GoogeAuthenticator;
var TwoFA = require('passport-2fa-totp').Strategy;
var CustomStrategy = require('passport-custom').Strategy;
var totp = require('notp').totp;
var base32 = require('hi-base32');
import Messager from '../utils/messager';

function handleDisconnect() {
    connection = mysql.createConnection(dbconfig.connection); // Recreate the connection, since
                                                    // the old one cannot be reused.
  
    connection.connect(function(err) {              // The server is either down
      if(err) {                                     // or restarting (takes a while sometimes).
        console.log('error when connecting to db:', err);
        setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
      }                                     // to avoid a hot loop, and to allow our node script to
    });                                     // process asynchronous requests in the meantime.
    connection.query('use sslwallet');                                   // If you're also serving http, display a 503 error.
    connection.on('error', function(err) {
      console.log('db error', err);
      if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
        handleDisconnect();                         // lost due to either server restart, or a
      } else {                                      // connnection idle timeout (the wait_timeout
        throw err;                                  // server variable configures this)
      }
    });
  }

handleDisconnect();
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
                        OTP:  Messager.generateOTP(6),
                        timestamp: new Date().getTime() + 60 * 3 * 1000,
                        twoFASetup: false
                    };
                    var insertQuery = "INSERT INTO users ( username, password,phone_number,OTP,timestamp,twofa_setup ) values (?,?,?,?,?,?)";

                    connection.query(insertQuery,[newUserMysql.username, newUserMysql.password,req.body.email,newUserMysql.OTP,newUserMysql.timestamp,newUserMysql.twoFASetup],async function(err, rows) {
                            if(err){
                                console.log(err);
                                return done('Cannot get DB. Please Try after sometime');
                            }
                        newUserMysql.id = rows.insertId;
                        console.log(await Messager.sendOTPMobile(req.body.email,'KOINTL','Complete Registration using '+newUserMysql.OTP ,newUserMysql.OTP));
                        return done(null, newUserMysql);
                    });
                }
            });
        })
    );

    passport.use(
        'local-login',
        new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField : 'username',
            passwordField : 'password',
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

                const OTP = Messager.generateOTP(6);

                Messager.sendOTPMobile(rows[0].phone_number,'KOINTL','Please Login using '+ OTP ,OTP)

                return done(null,rows[0])
            });
        })
    );

    // passport.use(
    //     'two-fa',
    //     new LocalStrategy({
    //         // by default, local strategy uses username and password, we will override with email
    //             usernameField: 'userId',
    //             passwordField: 'authCode',
    //         passReqToCallback: true
    //     },
    //     function(req, username,password, done) {
    //         connection.query("SELECT * FROM users WHERE id = ?",[username], function(err, rows){
    //             console.log(1);
    //             if (err)
    //                 {
    //                 console.log(2);
    //                 req.err = 'Server Error';
    //                 return done(err);
    //                 }
    //             if (!rows.length) {
    //                 console.log(3);
    //                 req.err = 'Please Try Registration Again';
    //                 return done(null,req.err); // req.flash is the way to set flashdata using connect-flash
    //             }
    //             var isValid = totp.verify(password,base32.decode.asBytes(rows[0].secret_text));
    //             console.log(isValid);
    //                 if(!isValid){
    //                     console.log(3);
    //                     req.err = 'Auth Token Invalid';
    //                     return done(null, req.err);
    //                 }

    //             connection.query('UPDATE users set twofa_setup=true where id=?',[username],function(err,res){
    //                 return done(null, rows[0]);
    //             });
    //         });
    //     })
    // );

    passport.use(
        'otp-auth',
        new CustomStrategy(function(req, done) {
            let userid = req.body.userId;
            let otp = req.body.authCode;
            connection.query("SELECT * FROM users WHERE id = ?",[userid],async function(err, rows){
                if (err) {
                    req.err = 'Server Error';
                    return done(err);
                }
                if (!rows.length) {
                    req.err = 'Please Try Registration Again';
                    return done(req.err); // req.flash is the way to set flashdata using connect-flash
                }
                let user = rows[0];
                let mobileNumber = user.phone_number;
                let verifyOTP = await Messager.verifyOTPMobile(mobileNumber, otp);
                console.log(verifyOTP);
                if (verifyOTP.message !== 'otp_verified') {
                    req.err = 'OTP Invalid';
                    return done(null, req.err);
                }

                connection.query('UPDATE users set twofa_setup=true where id=?',[userid],function(err,res){
                    return done(null, rows[0]);
                });
            });
        })
    );
};
