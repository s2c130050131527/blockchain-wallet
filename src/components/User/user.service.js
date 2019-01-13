import db from '../../database';
import request from "request-promise";
import wallet from '../../utils/createWallet'
import transactionUtils from '../../utils/transactionUtils'
import LOBSWalletUtils from "../../utils/LOBSWalletUtils";
class UserService {

    async getBalance(coin,address,account){
      const bal= await wallet.getBalance(coin,address,account)
        if(coin === 'LOBSTEX'){
          console.log('balance', bal)
        }
      return bal;
    }
    async getExchangeRate(fsym,tsym){
      console.log(fsym);
      if(fsym === 'LOBSTEX'){
        const options = {
          method: 'GET',
          uri: `https://api.coingecko.com/api/v3/simple/price?ids=lobstex-coin&vs_currencies=${tsym}`,
          json: true
        };
      let rate = await request(options);
      console.log(rate['lobstex-coin']);
      return parseFloat(rate['lobstex-coin'][tsym.toLowerCase()]);
      }
      var options = {
        method: 'GET',
        uri: `https://min-api.cryptocompare.com/data/price?fsym=${fsym.substring(0,3)}&tsyms=${tsym}`,
        json: true
      };
      
      const rate = await request(options);
      return parseFloat(rate[tsym]);
    }
    getTotalRecieved(address,coin,account){
      return wallet.getTotalRecieved(coin,address,account);
    }
    getTotalSent(address,coin,account){
      return wallet.getTotalSent(coin,address,account)

    }
    
    updateCurrency(userId,newCurrency,cb){
      db.db.collection('users').updateOne({id:userId}, {$set: {currency:newCurrency}},((err,res)=>{
        if(err){
          cb(err);
          return
        }
        cb(null,res);
      }));
    }
    async findUser(userId){
      let user = null;
      user = await db.db.collection('users').findOne({id:userId});
      return user;
    }
    validateAddress(coin,address){
      return wallet.validateAddress(coin,address);
    }
    async authorizeTransaction(transaction,wallets,cb){
      const coin = transaction.coin;
      const address = wallets[coin].address;
      const WIF = wallets[coin].WIF;


      await wallet.createTransaction(coin,transaction.minerFee,transaction.toAddr,address,WIF,parseFloat(transaction.amountRequested),cb)
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

    async getTransactionDetail(coin,address,account){
      console.log('getTransactionDetail',coin,address,account)
      return await LOBSWalletUtils.getTransactionDetail(address,account);

    }

    async getTransactionCount(coin, address,account){
      return await wallet.getTransactionCount(coin, address,account);
    }
    getAllUsers() {
      return this.users;
    }

    filterTransactions(txns, filter) {
      let finalTxns = [];
      let filterFlag = true;
      let typeFilter = transactionUtils.typeFilter();
      let confirmStatusFilter = transactionUtils.confirmStatusFilter();
      for (let k = 0; k < txns.length; k++) {
          if (filter.type && filter.type !== typeFilter.default && txns[k].type !== filter.type) {
            filterFlag = false;
          }
          if (filter.confirmStatus && filter.confirmStatus !== confirmStatusFilter.default) {
            if (filter.confirmStatus === confirmStatusFilter.confirmed &&
                txns[k].confirmation < 6) {
              filterFlag = false;
            }
            if (filter.confirmStatus === confirmStatusFilter.unconfirmed &&
                txns[k].confirmation >= 6) {
              filterFlag = false;
            }
          }
          if (filterFlag) {
            finalTxns.push(txns[k]);
          }
      }
      return finalTxns;
    }

    transformTransaction(txn, coin, userAddress) {
      let obj = {};
      obj.txHash = txn.txid;
      obj.fee = txn.fees;
      obj.mineDate = txn.time;
      obj.confirmation = txn.confirmations;
      obj.coin = coin;
      obj.from = [];
      obj.to = [];
      let fromAddresses = txn.vin;
      let toAddresses = txn.vout;
      let receivedTag;
      let sentTag;
      for (let p = 0; p < fromAddresses.length; p++) {
        let addObj = {};
        addObj.address = fromAddresses[p].addr;
        if (addObj.address !== userAddress) {
          receivedTag = true;
        }
        addObj.value = fromAddresses[p].value;
        obj.from.push(addObj);
      }
      for (let p = 0; p < toAddresses.length; p++) {
        let addObj = {};
        addObj.address = toAddresses[p].scriptPubKey.addresses[0];
        if (addObj.address === userAddress) {
          sentTag = true;
        }
        addObj.value = toAddresses[p].value;
        obj.to.push(addObj);
      }
      if (receivedTag) {
        obj.type = "Received";
      } else if(sentTag) {
        obj.type = "Sent";
      } else {
        obj.type = "Unknown";
      }
      return obj;
    }

}

export default new UserService();
