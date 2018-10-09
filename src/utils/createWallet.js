var bitcore = require('bitcore-explorers/node_modules/bitcore-lib');
import explorers from 'bitcore-explorers';
var insight = new explorers.Insight();
import bitcoreAddress from 'bitcoin-address';

class WalletUtils{
    
    createWallet(){
        const randomBuffer= bitcore.crypto.Random.getRandomBuffer(32);
        const randomNumber = bitcore.crypto.BN.fromBuffer(randomBuffer);
        const privateKey = new bitcore.PrivateKey(randomNumber);
        const WIF = privateKey.toWIF();
        const address = privateKey.toAddress();
        return {
            privateKey:privateKey.toObject(),WIF,address:address.toString()
        }
    }

    getBalance(address,cb){
        console.log('getting balance')
        let balance = 0;
        insight.getUnspentUtxos(address,(err,res) => {
          if(err){
            cb(err,balance)
          }
          console.log(res);
          res.map(r => {
            balance += r.satoshis;
          })
          cb(err,balance)
        })
    }

    createTransaction(toAddr,address,privateKey,amount,cb){
      if(!bitcoreAddress.validate(toAddr ,'mainnet')){
        cb('Address Not Valid',null)
        return;
      }
      insight.getUnspentUtxos(address,(err,utxos) => {
        if(err){
          cb(err)
          return
        }
        if (utxos.length == 0) {
         
          cb("You don't have enough Satoshis to cover the miner fee.");
          return;
        }
          let bitcore_transaction = new bitcore.Transaction()
                .from(utxos)
                .to(toAddr, amount)
                .change(address)
                .sign(new bitcore.PrivateKey.fromWIF(privateKey));

          
          if (bitcore_transaction.getSerializationError()) {
            let error = bitcore_transaction.getSerializationError().message;
            switch (error) {
              case 'Some inputs have not been fully signed':
                cb('Please check your private key'+error);
                break;
              default:
                cb(error);
            }
          }
          insight.broadcast(bitcore_transaction, function(error, body) {
            if (error) {
              cb('Error in broadcast: ' + error);
            } else {
              cb(null,body)
            }
          });
      })
    }
}

export default new WalletUtils();