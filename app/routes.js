// app/routes.js
module.exports = function(app, passport) {
    const bitcoin = require('bitcoin');
    const db = require("quick.db");
    const TaskTimer = require('tasktimer');
    const cors = require('cors');
    const jwt = require('jsonwebtoken');
    const serverSecret = 'simpleServerSecret'
    const expressJwt = require('express-jwt');
    const authenticate = expressJwt({secret : serverSecret});

    app.use(cors({origin:'http://ec2-54-250-242-188.ap-northeast-1.compute.amazonaws.com'}));

    
    app.post('/authenticate',authenticate , function (req,res) {    
        res.status(200).send({coinlist:['BTC','ETH','DGC']});        
    })
    // =====================================
    // HOME PAGE ===========================
    // =====================================
    app.get('/', function(req, res) {
        res.render('index.ejs'); // load the index.ejs file
    });

    app.get('/done', isLoggedIn,function(req, res) {
     
            res.render('done.ejs', {
                user: req.user// get the user out of session and pass to template
            })
    });

     app.get('/nobalance', isLoggedIn,function(req, res) {
     
            res.render('nobalance.ejs', {
                user: req.user// get the user out of session and pass to template
            })
    });


    //Add the text below without `\*` and `*/` for a new coin. 
    /* var coinName = new bitcoin.Client({
         host: '',
         port: ,
         user: '',
         pass: '',
         timeout: 30000
     }); */


    // ==================================== 
    // RPC SETUP ========================== 
    // ====================================


    var epic = new bitcoin.Client({
        host: '80.211.41.40',
        port: 8811,
        user: 'user6312',
        pass: 'some pass',
        timeout: 30000
    });



    // =====================================
    // LOGIN ===============================
    // =====================================


    app.post('/login', passport.authenticate('local-login', {
        session:false
        }),
        function(req, res, next) {
            if(req.err) {
                res.status(400).send({message:req.err});
                return;
            }
            req.token = jwt.sign(
                {id : req.user.id},serverSecret,
                {
                    expiresIn:"1 day"
                });
            res.status(200).json( {userId:req.user.id,userName:req.userName,token: req.token});
        });


    // =====================================
    // REGISTER ============================
    // =====================================

    app.get('/getqr/:id',function(req,res) {
        console.log(req.params.id);
    })

    app.post('/register', passport.authenticate('local-signup',{session:false}), function(req,res) {

        if(req.err) {
            res.status(400).send({message: req.err});
            return;
        }
        const imgCode = Buffer.from(req.user.qrInfo.qr).toString('base64');
        res.status(200).send({message: 'Registration Successful', userid: req.user.id, imgCode: imgCode});
    });


    app.post('/setuptwofa', passport.authenticate('two-fa',{session:false}),
    function (req,res) {
        if(req.err) {
            console.log(req.err);
            res.status(400).send({message: req.err});
            return;
        }
        res.status(200).send({message: 'Signup Successful', userid: req.user.id});
    });
    // ====================================
    // WALLET =============================
    // ====================================

    app.get('/wallet', isLoggedIn, async function(req, res) {


            // ====================================    
            // GET BALANCE   ======================
            // ==================================== 

            let epic = await db.fetch(`EPIC_Balance_id_${req.user.id}`);

            // ====================================
            // IF NULL === 0,00 ===================
            // ====================================

            if (epic === null)
                epic = "0.00";


            // ====================================
            // VARIABLES ==========================
            // ====================================

            res.render('wallet.ejs', {
                user: req.user, // get the user out of session and pass to template
                epic: epic
            })

        });

    // ====================================
    // RECEIVE ============================
    // ====================================


    app.get('/receive', isLoggedIn, function(req, res) {



        epic.getNewAddress(function(err, address_epic, resHeaders) {

                index.getNewAddress(function(err, address_index, resHeaders) {
                   

                var timer = new TaskTimer(1000);
                timer.start();
                timer.addTask({
                    name: 'receive', // unique name of the task
                    tickInterval: 1, // run every 5 ticks (5 x interval = 5000 ms)
                    totalRuns: 1000, // run 10 times only. (set to 0 for unlimited times)
                    callback: function(task) {
                        epic.getReceivedByAddress(address_epic, function(err, balance_epic, resHeaders) {
                            if (balance_epic > 0) {
                                timer.stop();
                                db.add(`EPIC_Balance_id_${req.user.id}`, balance_epic);
                            }
                        });
                    }
                });       
        



                res.render('receive.ejs', {
                    user: req.user, // get the user out of session and pass to template
                    epic: address_epic
                });
            });
        });
     
    });



    // ====================================
    // SEND PAGES =========================
    // ====================================



    app.get('/send-epic', isLoggedIn, async function(req, res) {
            let balance = await db.fetch(`EPIC_Balance_id_${req.user.id}`);
            res.render('send-epic.ejs', {
                user: req.user,// get the user out of session and pass to template
                balance : balance
            })
    });






    app.post('/send-epic',isLoggedIn, async function(req, res) {

        var amount = req.body.amount;
        var address = req.body.address;
        let balance = await db.fetch(`EPIC_Balance_id_${req.user.id}`);
        if (balance <= 0) {res.redirect("nobalance")}else { 
      epic.sendToAddress(address, parseFloat(amount), async function(err, epic, resHeaders) {
            if (err) return console.log(err);
            
            if(epic){
                db.subtract(`EPIC_Balance_id_${req.user.id}`,  parseFloat(amount));
                console.log("Send");
                res.redirect('/done');

            }
        });
      }

    });





    // =====================================
    // LOGOUT ==============================
    // =====================================

    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });
};


// route middleware to make sure
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}