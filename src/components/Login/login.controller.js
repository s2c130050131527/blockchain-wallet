const jwt = require('jsonwebtoken');
const serverSecret = 'simpleServerSecret';
import loginService from './login.service';
import walletUtils from '../../utils/createWallet';
import flatFist from '../../utils/FlatList';

class UserController {

    async loginUser(req, res){
        if(req.err) {
            res.status(400).send({message:req.err});
            return;
        }
        res.status(200).send({userId:req.user.id, timestamp: new Date().getTime()+60*2*1000});


    }
    async verifyLoginOTP(req,res){
        if(req.err){
            res.status(400).send({message:req.err})
            return;
        }
        req.token = jwt.sign(
            {id : req.user.id},serverSecret,
            {
                expiresIn:"1 day"
            });
        const user = await loginService.findUser(req.user.id);
        if(!user){
            res.status(400).send('Not a valid user');
            return;
        }
        let wallet = null;

        if(!user.walletCreated){
            try {
                wallet = await walletUtils.createWallet(user.username);
            } catch (error) {
                console.log('____________________________', error);
            }
            loginService.addWallet(wallet, parseInt(req.user.id),(err,client) => {
                if(err){
                    res.status(500).send(err);
                    return;
                }
                res.status(200).json({userId:req.user.id,userName:user.username,token: req.token,wallet :wallet});
            });
        }else{
            res.status(200).json({userId:req.user.id,userName:user.username,token: req.token});
        }
    }
    registerUser(req, res){
        if(req.err) {
            res.status(400).send({message: req.err});
            return;
        }
        res.status(200).send({message: 'Registration Successful', username: req.user.username ,userid: req.user.id,timestamp:req.user.timestamp});
    }
    setuptwoFA(req, res){
        if(req.err) {
            res.status(400).send({message: req.err});
            return;
        }
        req.user.walletCreated =false;
        req.user.currency = [];
        req.user.currency.push(flatFist[0]);
        loginService.addUser(req.user);
        res.status(200).send({message: 'Signup Successful', userid: req.user.id});
    }
    getQR(req, res){

    }
}

export default UserController;
