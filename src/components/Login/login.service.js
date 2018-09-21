import db from '../../database';
class LoginService {
    'use strict'
    constructor(){
      this.db = db;
    }

    addUser(user){
      db.insertOne(user,(err,res) => {
        console.log('User Added');
      });
    }

    findUser(userId){
      db.findOne({id: userId},(err,res) => {
        return res;
      })
    }

    addWallet(wallet, userId){
      db.updateOne({id:userId}, {$set: {wallet:wallet}},(err, res) => {
        console.log('wallet added');
      });
    }
  }

export default new LoginService();
