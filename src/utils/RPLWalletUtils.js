const rippleLib = require('ripple-lib');
import AddressValidator from 'wallet-address-validator';
import request from 'request-promise';
const rippleApi = new rippleLib.RippleAPI({
    server: 'wss://s.altnet.rippletest.net:51233',
});
rippleApi.connect();

class RPLWalletUtils {

    async createWallet(){
        
        const account = await request({
            method:'POST',
            uri: 'https://faucet.altnet.rippletest.net/accounts',
            json:true
        })
        const Address = account.account;
        return {
            privateKey:Address.secret,WIF:Address.secret,address:Address.address,minerFee:0.0005
        }
    }
    async getBalance(address){
        const balances = await rippleApi.getBalances(address);
        console.log(balances);
        return {confirmBalance: parseFloat(balances[0].value), unconfirmedBalance:parseFloat(balances[0].value)}
    }
    async validateAddress(address){
        return AddressValidator.validate(address,'XRP','testnet');
    }
    async getTotalRecieved(address,coin){
        return 0;
    }
    async getTotalSent(address,coin){
        return 0;
    }
    async createTransaction(minerFee,toAddr,address,privateKey,amount,cb) {
        const payment = {
            source: {
              address: address,
              maxAmount: {
                value: amount,
                currency: 'XRP'
              }
            },
            destination: {
              address: toAddr,
              amount: {
                value: amount,
                currency: 'XRP'
              }
            }
          };

          try{
            const transactionObject = await rippleApi.preparePayment(address,payment,{
                maxLedgerVersionOffset: 5
            });
            console.log(transactionObject);
            const { signedTransaction } = api.sign(transactionObject.txJSON, privateKey);
            console.log('Signed', signedTransaction);
            const body = rippleApi.submit(signedTransaction);
            cb(null,body);
          }catch(err){
            console.log(err);
            cb(err);
          }
    }

}

export default new RPLWalletUtils();