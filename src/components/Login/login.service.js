import db from '../../database';
class LoginService {
    'use strict'
    constructor(){
      this.db = db;
    }

    addUser(user){
      db.db.collection('users').insertOne(user,(err,res) => {
        console.log('User Added');
      });
    }

    async findUser(userId){
      let user = null;
      console.log(userId);
      user = await db.db.collection('users').findOne({id:userId});
      return user;
    }

    addWallet(wallet, userId,cb){
      db.db.collection('users').updateOne({id:userId}, {$set: {wallet:wallet,walletCreated:true}},((err,res)=>{
        if(err){
          console.log(err)
          cb(err);
          return
        }
        cb(null,res);
      }));
    }
  }

export default new LoginService();
