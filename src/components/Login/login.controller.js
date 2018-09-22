const jwt = require('jsonwebtoken');
const serverSecret = 'simpleServerSecret';
import loginService from './login.service';
import walletUtils from '../../utils/createWallet';

class UserController {
  
    async loginUser(req, res){
        if(req.err) {
            res.status(400).send({message:req.err});
            return;
        }
        req.token = jwt.sign(
            {id : req.user.id},serverSecret,
            {
                expiresIn:"1 day"
            });
        const user = await loginService.findUser(req.user.id);
        console.log(user);
        if(!user){
            res.status(400).send('Not a valid user');
        }
        let wallet = null;
        if(!user.walletCreated){
            wallet = walletUtils.createWallet();
            loginService.addWallet(wallet, req.user.id);
        }
        res.status(200).json({userId:req.user.id,userName:req.userName,token: req.token,wallet});
    }
    registerUser(req, res){
        if(req.err) {
            res.status(400).send({message: req.err});
            return;
        }
        const imgCode = Buffer.from(req.user.qrInfo.qr).toString('base64');
        res.status(200).send({message: 'Registration Successful', userid: req.user.id, imgCode: imgCode});
    }
    setuptwoFA(req, res){
        if(req.err) {
            console.log(req.err);
            res.status(400).send({message: req.err});
            return;
        }
        req.user.walletCreated =false;
        loginService.addUser(req.user);
        res.status(200).send({message: 'Signup Successful', userid: req.user.id});
    }
    getQR(req, res){
  
    }
}

export default UserController;
