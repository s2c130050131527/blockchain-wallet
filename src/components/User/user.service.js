import db from '../../database';
import request from "request-promise";
import wallet from '../../utils/createWallet'
class UserService {
    'use strict'

    constructor() {
      this.users = [];
    }

    async getBalance(coin,address){
      const bal= await wallet.getBalance(coin,address)
      console.log(bal);
      return bal;
    }
    async getExchangeRate(fsym,tsym){
      var options = {
        method: 'GET',
        uri: `https://min-api.cryptocompare.com/data/price?fsym=${fsym.substring(0,3)}&tsyms=${tsym}`,
        json: true
      }
      const rate = await request(options);
      return parseFloat(rate[tsym]);
    }
    getTotalRecieved(address,coin){
      console.log('here');
      return wallet.getTotalRecieved(coin,address);
    }
    getTotalSent(address,coin){
      return wallet.getTotalSent(coin,address)
     
    }
    async findUser(userId){
      let user = null;
      user = await db.db.collection('users').findOne({id:userId});
      return user;
    }
    validateAddress(coin,address){
      return wallet.validateAddress(coin,address);
    }
    authorizeTransaction(transaction,wallets,cb){
      const coin = transaction.coin;
      const address = wallets[coin].address;
      const WIF = wallets[coin].WIF;


      wallet.createTransaction(coin,transaction.minerFee,transaction.toAddr,address,WIF,parseFloat(transaction.amountRequested),cb)
    }
    addTransaction(userId,transaction,cb) {
      db.db.collection('users').findOne({id:userId},(err,res)=>{
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
