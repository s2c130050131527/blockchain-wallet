import CoinList from './CoinList';
import BTCWalletUtil from './BTCWalletUtils';
import LTCWalletUtil from './LTCWalletUtils';
import XRPWalletUtil from './XRPWalletUtils';
import ETHWalletUtil from './ETHWalletUtils';

class WalletUtils{
    
    async createWallet(){
        let walletArray = {};
        walletArray['BTCTEST']=BTCWalletUtil.createWallet();
        walletArray['LTCTEST']=LTCWalletUtil.createWallet();
        walletArray['XRPTEST']=await XRPWalletUtil.createWallet();
        walletArray['ETHTEST']=await ETHWalletUtil.createWallet();

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
        case 'XRPTEST':
          return await XRPWalletUtil.getBalance(address);
          break;
        case 'ETHTEST':
          return await ETHWalletUtil.getBalance(address);
          break;
        }
       

    }

    getTotalRecieved(coin,address){
      switch(coin) {
        case 'BTCTEST':
          return  BTCWalletUtil.getTotalRecieved(address);
          break;
        case 'LTCTEST':
          return LTCWalletUtil.getTotalRecieved(address);
          break;
        case 'XRPTEST':
          return XRPWalletUtil.getTotalRecieved(address);
          break;
        case 'ETHTEST':
          return ETHWalletUtil.getTotalRecieved(address);
          break;
        }  
    }
    validateAddress(coin,address){
      switch(coin) {
        case 'BTCTEST':
          return  BTCWalletUtil.validateAddress(address);
          break;
        case 'LTCTEST':
          return LTCWalletUtil.validateAddress(address);
          break;
        case 'XRPTEST':
          return XRPWalletUtil.validateAddress(address);
          break;
        case 'ETHTEST':
          return ETHWalletUtil.validateAddress(address);
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
        case 'XRPTEST':
          return XRPWalletUtil.getTotalSent(address);
          break;
        case 'ETHTEST':
          return ETHWalletUtil.getTotalSent(address);
          break;
        }
    }
    async createTransaction(coin,minerFee,toAddr,address,privateKey,amount,cb){
      console.log(coin,minerFee,toAddr,address,privateKey,amount)
      switch(coin) {
        case 'BTCTEST':
          return BTCWalletUtil.createTransaction(minerFee*100000000,toAddr,address,privateKey,amount*100000000,cb);
          break;
        case 'LTCTEST':
          return LTCWalletUtil.createTransaction(minerFee*100000000,toAddr,address,privateKey,amount*100000000,cb);
          break;
        case 'XRPTEST':
          return XRPWalletUtil.createTransaction(minerFee*100000000,toAddr,address,privateKey,amount,cb);
          break;
        case 'ETHTEST':
          return await ETHWalletUtil.createTransaction(minerFee*100000000,toAddr,address,privateKey,amount,cb);
          break;
        }
    }
    async getTransactionCount(coin, address){
      switch (coin){
        case 'ETHTEST':
          return await ETHWalletUtil.getTransactionCount(address);
      }
    }
}

export default new WalletUtils();