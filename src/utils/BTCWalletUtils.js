var bitcore = require('bitcore-lib');
import explorers from 'bitcore-explorers';
var insight = new explorers.Insight();
import bitcoreAddress from 'bitcoin-address';
import request from 'request-promise';
class BTCWalletUtils{
    
    createWallet(){
        const randomBuffer= bitcore.crypto.Random.getRandomBuffer(32);
        const randomNumber = bitcore.crypto.BN.fromBuffer(randomBuffer);
        const privateKey = new bitcore.PrivateKey(randomNumber);
        const WIF = privateKey.toWIF();
        const address = privateKey.toAddress();
        return {
            privateKey:privateKey.toObject(),WIF,address:address.toString(),minerFee:0.0005
        }
    }

    async getBalance(address){
      
      var options = {
        method: 'GET',
        uri: 'https://api.blockcypher.com/v1/btc/main/addrs/'+address+'/full',
        json: true,
      }
      const balance = await request(options);
      return {confirmBalance: parseFloat(balance.balance)/100000000, unconfirmedBalance:parseFloat(balance.unconfirmed_balance)/100000000}
      
    }

    async validateAddress(address){
      var options = {
        method: 'GET',
        uri: 'https://chain.so/api/v2/is_address_valid/BTC/'+address,
        json: true,
      }
      const balance = await request(options);
      return balance.data.is_valid
    }
    
    async getTotalRecieved(address,coin){
      var options = {
        method: 'GET',
        uri: 'https://api.blockcypher.com/v1/btc/main/addrs/'+address+'/full?limit=50',
        json: true,
      }
      const balance = await request(options);
      return parseFloat(balance.total_received)/100000000
    }
    async getTotalSent(address,coin){
      var options = {
        method: 'GET',
        uri: 'https://api.blockcypher.com/v1/btc/main/addrs/'+address+'/full?limit=50',
        json: true,
      }
      const balance = await request(options);
      return parseFloat(balance.total_sent)/100000000;
     
    }

    createTransaction(minerFee,toAddr,address,privateKey,amount,cb){
      
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
                .fee(minerFee)
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

export default new BTCWalletUtils();