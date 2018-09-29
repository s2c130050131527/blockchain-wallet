import db from '../../database';
class UserService {
    'use strict'

    constructor() {
      this.users = [];
    }
    async findUser(userId){
      let user = null;
      console.log(userId);
      user = await db.db.collection('users').findOne({id:userId});
      return user;
    }
    addTransaction(userId,transaction,cb) {
      console.log(userId)
      db.db.collection('users').findOne({id:userId},(err,res)=>{
        console.log('user Res' ,res.transactions);
        if(res.transactions && res.transactions.length){
          const newTrans = {
            id: res.transactions.length + 1,
            transaction: transaction,
            status : 'Added'
          }
          db.db.collection('users').updateOne({id:userId},{$push : {transactions:[newTrans]}},(err,res)=>{
            cb(newTrans.id);
          });
        }else{
          const newTrans = [{
            id: 1,
            transaction: transaction,
            status : 'Added'
        }]
        db.db.collection('users').updateOne({id:userId},{$set : {transactions:newTrans}},(err,res)=>{
          cb(newTrans.id);
        });
        }
      });
      
    }
    getAllUsers() {
      return this.users;
    }
}

export default new UserService();
