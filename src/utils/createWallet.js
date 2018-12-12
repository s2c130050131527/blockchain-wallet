import CoinList from './CoinList';
import BTCWalletUtil from './BTCWalletUtils';
import LTCWalletUtil from './LTCWalletUtils';
import RPLWalletUtil from './RPLWalletUtils';

class WalletUtils{
    
    async createWallet(){
        let walletArray = {};
        walletArray['BTCTEST']=BTCWalletUtil.createWallet();
        walletArray['LTCTEST']=LTCWalletUtil.createWallet();
        walletArray['RPLTEST']=await RPLWalletUtil.createWallet();
        return walletArray;
    }

    async getBalance(coin,address){
      switch(coin) {
        case 'BTCTEST':
          return await BTCWalletUtil.getBalance(address);
          break;
        case 'LTCTEST':
          return await LTCWalletUtil.getBalance(address);
          break;
        case 'RPLTEST':
          return await RPLWalletUtil.getBalance(address);
          break;
        }
       

    }

    getTotalRecieved(coin,address){
      console.log('here');
      console.log(coin);
      switch(coin) {
        case 'BTCTEST':
          return  BTCWalletUtil.getTotalRecieved(address);
          break;
        case 'LTCTEST':
          return LTCWalletUtil.getTotalRecieved(address);
          break;
        case 'RPLTEST':
          return RPLWalletUtil.getTotalRecieved(address);
          break;
        }  
    }
    validateAddress(coin,address){
      console.log('here');
      console.log(coin);
      switch(coin) {
        case 'BTCTEST':
          return  BTCWalletUtil.validateAddress(address);
          break;
        case 'LTCTEST':
          return LTCWalletUtil.validateAddress(address);
          break;
        case 'RPLTEST':
          return RPLWalletUtil.validateAddress(address);
          break;
        }  
    }
    getTotalSent(coin,address){
      switch(coin) {
        case 'BTCTEST':
          return BTCWalletUtil.getTotalSent(address);
          break;
        case 'LTCTEST':
          return LTCWalletUtil.getTotalSent(address);
          break;
        case 'RPLTEST':
          return RPLWalletUtil.getTotalSent(address);
          break;
        }
    }
    createTransaction(coin,minerFee,toAddr,address,privateKey,amount,cb){
      console.log(coin,minerFee,toAddr,address,privateKey,amount)
      switch(coin) {
        case 'BTCTEST':
          return BTCWalletUtil.createTransaction(minerFee*100000000,toAddr,address,privateKey,amount*100000000,cb);
          break;
        case 'LTCTEST':
          return LTCWalletUtil.createTransaction(minerFee*100000000,toAddr,address,privateKey,amount*100000000,cb);
          break;
        case 'RPLTEST':
          return RPLWalletUtil.createTransaction(minerFee*100000000,toAddr,address,privateKey,amount,cb);
          break;
        }
    }
}

export default new WalletUtils();