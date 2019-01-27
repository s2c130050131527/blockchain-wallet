
var BtcPromise = require( 'bitcoin-promise' ) ;
import SomeInsight from "litecore-lib";

const Transaction = SomeInsight.Transaction;


import request from 'request-promise';
import { connectableObservableDescriptor } from "rxjs/observable/ConnectableObservable";
class BTCWalletUtils{
    constructor() {
        this.client = new BtcPromise.Client({
            host:'149.28.135.88',
	          port: 8332,
	          user: 'kointel',
	          pass: '_rY8!p@o2ku#kX.J',
	          timeout: 30000
        })
    }

    async createWallet(account){
        const address = await this.client.getNewAddress(account);
        const privateKey = await this.client.dumpPrivKey(address);
        return {privateKey,WIF:privateKey,address,minerFee : 0.00005}
    }

    async getBalance(address,account){
      console.log(account,address,'check');
      const balance = await this.client.getBalance(account,0);
      console.log('bal',balance,account);
      return {confirmBalance: parseFloat(balance), unconfirmedBalance:0.0}

    }

    async validateAddress(address){
     const result = await this.client.validateAddress(address);
     return result.isvalid;
    }

    async getTotalRecieved(address,coin,account){
      const total =  await this.client.getReceivedByAccount(account,0);
      return parseFloat(total);
    }
    async getTotalSent(address,coin,account){
      const totalRecieved = await this.getTotalRecieved('','',account);
      const bal = await this.getBalance('',account);
      const totalSent = parseFloat(totalRecieved)- parseFloat(bal.confirmBalance);
      return totalSent;

    }

    async getTransactionDetail(address,account){
      const tx = await this.client.listTransactions(account,999999);
      const resultTXS = await Promise.all(tx.map(async (singleTx) =>{
        const rawTx = await this.client.getRawTransaction(singleTx.txid);
        const decodedTx = await this.client.decodeRawTransaction(rawTx);
        return decodedTx;
      }
      ))
      return resultTXS;
    }

    async getTransactionCount(address,account){
      const tx = await this.client.listTransactions(account,999999);
      return tx.length;
    }

    transformTransaction(transaction){
      var confirmations = 0;

      // if(transaction.__height >= 0) {
      //   confirmations = this._block.getTip().height - transaction.__height + 1;
      // }

      var transformed = {
        txid: transaction.txid(),
        version: transaction.version,
        locktime: transaction.locktime
      };

      if(transaction.inputs[0].isCoinbase()) {
        transformed.isCoinBase = true;
        transformed.vin = [
          {
            coinbase: transaction.inputs[0].script.toJSON(),
            sequence: transaction.inputs[0].sequence,
            n: 0
          }
        ];
      } else {
        options.inputValues = transaction.__inputValues;
        transformed.vin = transaction.inputs.map(this.transformInput.bind(this, options));
        transformed.valueIn = transaction.inputSatoshis / 1e8;
        transformed.fees = transaction.feeSatoshis / 1e8;
      }

      transformed.vout = transaction.outputs.map(this.transformOutput.bind(this, options));

      transformed.blockhash = transaction.blockhash;
      transformed.blockheight = transaction.__height;
      transformed.confirmations = confirmations;

      var time = transaction.__timestamp ? transaction.__timestamp : Math.round(Date.now() / 1000);
      transformed.time = time;
      if (transformed.confirmations) {
        transformed.blocktime = transformed.time;
      }

      transformed.valueOut = transaction.outputSatoshis / 1e8;
      transformed.size = transaction.getSize();

      return transformed;

    }
    createTransaction(minerFee,toAddr,address,privateKey,amount1,cb){
    this.client.listUnspent(6,9999999,[address]).then(res=>{
      if(res.length === 0){
        cb('Wait for minimum 6 comfirmations');
      }else{
        let sum = 0;
        const txFilter = [];
        const txFilter1 = [];
        res.every((element) => {
          if(sum > amount1){
            return false;
          }
         const {vout, txid,amount,scriptPubKey} = element;
         sum = sum + amount;
         txFilter.push({txid,vout});
         txFilter1.push({txid,vout,scriptPubKey,amount});
         return true;
        })
        if(sum <= amount1){
          cb('Low balance. Please try after some time',null);
          return;
        }
        this.client.createRawTransaction(txFilter,{[toAddr]:amount1, [address]: sum - amount1 - minerFee }).then(res1 => {
          this.client.signRawTransaction(res1,txFilter1,[privateKey]).then(res2=> {
            this.client.sendRawTransaction(res2.hex).then(res3=>{
              cb(null,res3);
            }).catch(err=>{
              cb(err,null);
            });
          }).catch(err => {
            cb(err,null)
          })
        }).catch(err=> {
          cb(err,null)
        })
      }
    }).catch(err => {
      cb(err,null);
    })
    }
}


export default new BTCWalletUtils();
