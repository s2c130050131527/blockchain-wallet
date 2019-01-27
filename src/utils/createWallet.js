import CoinList from './CoinList';
import BTCWalletUtil from './BTCWalletUtils';
import LTCWalletUtil from './LTCWalletUtils';
import XRPWalletUtil from './XRPWalletUtils';
import ETHWalletUtil from './ETHWalletUtils';
import LOBSWalletUtil from './LOBSWalletUtils';

class WalletUtils{
    
    async createWallet(accountName){
        let walletArray = {};
        walletArray['BTCTEST']=BTCWalletUtil.createWallet();
        walletArray['LTCTEST']=LTCWalletUtil.createWallet();
        walletArray['XRPTEST']=await XRPWalletUtil.createWallet();
        walletArray['ETHTEST']=await ETHWalletUtil.createWallet();
        //walletArray['LOBSTEX'] = await LOBSWalletUtil.createWallet(accountName);
        return walletArray;
    }

    async getBalance(coin,address,account){
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
        case 'LOBSTEX':
          return await LOBSWalletUtil.getBalance(address,account);
          break;
        }
       

    }

    getTotalRecieved(coin,address,account){
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
        case 'LOBSTEX':
          return LOBSWalletUtil.getTotalRecieved(address,'',account);
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
        case 'LOBSTEX':
          return LOBSWalletUtil.validateAddress(address);
          break;
        }  
    }
    getTotalSent(coin,address,account){
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
        case 'LOBSTEX':
          return LOBSWalletUtil.getTotalSent(address,'',account);
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
        case 'LOBSTEX':
          return await LOBSWalletUtil.createTransaction(minerFee,toAddr,address,privateKey,amount,cb);
          break;
        }
    }
    async getTransactionCount(coin, address,account){
      switch (coin){
        case 'ETHTEST':
          return await ETHWalletUtil.getTransactionCount(address);
        case 'LOBSTEX':
          return await LOBSWalletUtil.getTransactionCount(address,account);
      }
    }
}

export default new WalletUtils();