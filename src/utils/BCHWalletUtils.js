var bchcore = require('litecore-lib');
import explorers from 'litecore-explorers';
var insight = new explorers.Insight('https://test-bch-insight.bitpay.com','testnet');
import request from 'request-promise';
class LTCWalletUtils{
    
    createWallet(){
        const randomBuffer= litecore.crypto.Random.getRandomBuffer(32);
        const randomNumber = litecore.crypto.BN.fromBuffer(randomBuffer);
        const privateKey = new litecore.PrivateKey(randomNumber,'testnet');
        const WIF = privateKey.toWIF();
        const address = privateKey.toAddress();
        return {
            privateKey:privateKey.toObject(),WIF,address:address.toString(),minerFee:0.0001
        }
    }

    async getBalance(address){
      
      var options = {
        method: 'GET',
        uri: 'https://chain.so/api/v2/get_address_balance/LTCTEST/'+address+'/0',
        json: true,
      }
      const balance = await request(options);
      return {confirmBalance: parseFloat(balance.data.confirmed_balance), unconfirmedBalance:parseFloat(balance.data.unconfirmed_balance)}
      
    }

    async getTotalRecieved(address,coin){
      var options = {
        method: 'GET',
        uri: 'https://chain.so/api/v2/get_address_received/BCHTEST/'+address,
        json: true,
      }
      const balance = await request(options);
      console.log(coin,balance)

      return parseFloat(balance.data.confirmed_received_value)  + parseFloat(balance.data.unconfirmed_received_value)
    }
    async getTotalSent(address,coin){
      var options = {
        method: 'GET',
        uri: 'https://chain.so/api/v2/get_address_spent/BCHTEST/'+address,
        json: true,
      }
      const balance = await request(options);
      return parseFloat(balance.data.confirmed_sent_value)  + parseFloat(balance.data.unconfirmed_sent_value)
     
    }
    async validateAddress(address){
      var options = {
        method: 'GET',
        uri: 'https://chain.so/api/v2/is_address_valid/LTCTEST/'+address,
        json: true,
      }
      const balance = await request(options);
      return balance.data.is_valid
    }

    createTransaction(minerFee,toAddr,address,privateKey,amount,cb){
      console.log(insight)
      insight.getUtxos(address,(err,utxos) => {
        console.log(utxos);
        if(err){
          cb(err)
          return
        }
        if (utxos.length == 0) {
         
          cb("You don't have enough Satoshis to cover the miner fee.");
          return;
        }
          let litecore_transaction = new litecore.Transaction()
                .from(utxos)
                .to(toAddr, amount)
                .fee(minerFee)
                .change(address)
                .sign(new litecore.PrivateKey.fromWIF(privateKey));
         
          if (litecore_transaction.getSerializationError()) {
            let error = litecore_transaction.getSerializationError().message;
            switch (error) {
              case 'Some inputs have not been fully signed':
                cb('Please check your private key'+error);
                break;
              default:
                cb(error);
            }
          }
          insight.broadcast(litecore_transaction, function(error, body) {
            if (error) {
              cb('Error in broadcast: ' + error);
            } else {
              cb(null,body)
            }
          });
      })
    }
}

export default new LTCWalletUtils();