var bitcore = require('bitcore-lib');
import explorers from 'bitcore-explorers';
var insight = new explorers.Insight('testnet');


class WalletUtils{
    
    createWallet(){
        const randomBuffer= bitcore.crypto.Random.getRandomBuffer(32);
        const randomNumber = bitcore.crypto.BN.fromBuffer(randomBuffer);
        const privateKey = new bitcore.PrivateKey(randomNumber,bitcore.Networks.testnet);
        const WIF = privateKey.toWIF();
        const address = privateKey.toAddress();
        return {
            privateKey:privateKey.toString(),WIF,address:address.toString()
        }
    }

    getBalance(address,cb){
        console.log('getting balance')
        let balance = 0;
        insight.getUnspentUtxos(address,(err,res) => {
          if(err){
            cb(err,balance)
          }
          res.map(r => {
            balance += r.satoshis;
          })
          cb(err,balance)
        })
    }
}

export default new WalletUtils();