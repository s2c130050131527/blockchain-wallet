import UserService from './user.service';
import userService from './user.service';
import CoinList from '../../utils/CoinList';
import TransactionsUtils from '../../utils/transactionUtils';
import cache from 'memory-cache';
import uuidv4 from 'uuid/v4';
import flatFist from '../../utils/FlatList';
import request from "request-promise";
import messager from '../../utils/messager';
class UserController {
  async getBalance(req, res) {
    const user = await UserService.findUser(parseInt(req.user.id));
    const address = user.wallet[req.params.coin].address;
    const CoinSymbol = CoinList.map(e => {
      return e.symbol;
    });
    if(CoinSymbol.indexOf(req.params.coin) === -1){
      res.status(404).send({
        message:'We do not support the requested coin'
      })
    }
    const coinObj = CoinList.filter((el)=>{
      el.symbol === req.params.coin;
    })
    const resBody = {...coinObj};
    try {
    resBody.address = address;
    const balanceRes = await UserService.getBalance(req.params.coin, address,user.username);
    if(req.params.coin === "LOBSTEX"){
      console.log(balanceRes,'balanceRes');
    }
    resBody.balance = (balanceRes.confirmBalance + balanceRes.unconfirmedBalance);
    const flatCurrency = user.currency[0].currency;
    console.log(flatCurrency)
    resBody.exchangeRate = await UserService.getExchangeRate(req.params.coin,flatCurrency);
    resBody.flatBalance = resBody.balance * resBody.exchangeRate;
    resBody.flatCurrency = flatCurrency;
    resBody.flatSymbol = user.currency[0].symbol;
    resBody.totalMoneySent = await userService.getTotalSent(address,req.params.coin,user.username);
    resBody.totalMoneyRecieved = await userService.getTotalRecieved(address,req.params.coin,user.username);
    }catch(err){
      console.log(err);
      res.status(400).send('Something Went Wrong');
      return;
    }
    res.status(200).send(resBody);

  }

  async getTransaction(req,res){
    const user = await UserService.findUser(parseInt(req.user.id));
    let CoinSymbol = CoinList.map(e => {
      return e.symbol;
    });
    let reqQuery = req.query || {};
    reqQuery.coin = reqQuery.coin || "All";
    console.log(reqQuery);
    let coins = (reqQuery.coin === "All" || !reqQuery.coin) ? CoinSymbol : reqQuery.coin;
    console.log(coins)
    if (typeof(coins)==='string') {
      coins = [coins];
    }
    let addresses = {};
    for (let k = 0; k < coins.length; k++) {
      if (CoinSymbol.indexOf(coins[k]) === -1) {
        res.status(404).send({
          message:'We do not support the requested coin'
        });
        return;
      }
      addresses[coins[k]] = user.wallet[coins[k]].address;
    }
    let txList = [];
    let txFilters = {
      "type": reqQuery.type || "All",
      "confirmStatus": reqQuery.confirmStatus || "Any"
    }
    for (let i = 0; i < coins.length; i++) {
      let options = {
        method: 'GET',
        uri: TransactionsUtils.sources()[coins[i]].replace(/ADDRESS/g, addresses[coins[i]]),
        json: true,
      }
      let txs;
      if(coins[i] === 'LOBSTEX'){
      txs = {
        txs: await UserService.getTransactionDetail(coins[i], addresses[coins[i]],user.username),
      }
      }
      else{
      txs = await request(options);
      }
      console.log(txs);
      txs.txs.forEach((txn) => {
        let transformedTxn = UserService.transformTransaction(txn, coins[i], addresses[coins[i]]);
        txList = txList.concat(UserService.filterTransactions([transformedTxn], txFilters));
      })
    }
    txList = txList.sort((a,b) => {
      a.mineDate - b.mineDate;
    })
    res.status(200).send({txList});
  }

  getTransactionFilters(req,res){
    const coins = CoinList.map(coin => coin.symbol);
    coins.unshift(['All']);
    const type=['All','Recieved','Sent'];
    res.status(200).send({coins,type})
  }
  async getWallets(req,res){
    const user = await UserService.findUser(parseInt(req.user.id));
    const walletsInfo = [];
    let totalBalance = 0;
    let totalSent = 0;
    let totalRecieved = 0;
    try {
        await Promise.all(CoinList.map(async (coin) => {
        const coinRes = { ...coin };
        const wallet = user.wallet[coin.symbol];
        const balanceRes = await userService.getBalance(coin.symbol,wallet.address,user.username);
        coinRes.balance = (balanceRes.confirmBalance + balanceRes.unconfirmedBalance)
        coinRes.confirmBalance = balanceRes.confirmBalance;
        coinRes.flatCurrency = user.currency[0].currency;
        let options = {
          method: 'GET',
          uri: TransactionsUtils.sources()[coin.symbol].replace(/ADDRESS/g, wallet.address),
          json: true,
        }
        let txs ={};
        if(coin.symbol !== 'ETHTEST' && coin.symbol !== 'LOBSTEX'){
         txs = await request(options);
        }
        // console.log(txs.transactions.length, '------------txs',coin.symbol)
        // coinRes.txs = coin.symbol === 'XRPTEST' ? txs.transactions.length : txs.txs.length;
        switch(coin.symbol){
          case 'LOBSTEX':
           coinRes.txs = await UserService.getTransactionCount(coin.symbol,wallet.address,user.username)
            break;
          case 'ETHTEST':
           coinRes.txs = await UserService.getTransactionCount(coin.symbol,wallet.address,user.username)
            break;
          case 'XRPTEST':
            coinRes.txs = txs.transactions.length;
            break;
          default: 
            coinRes.txs = txs.txs.length;
            break;
        }
        coinRes.exchangeRate = await userService.getExchangeRate(coin.symbol,coinRes.flatCurrency);
        coinRes.balanceInCurrency = coinRes.exchangeRate * coinRes.balance;
        totalBalance += coinRes.balanceInCurrency;
        totalSent += await userService.getTotalSent(wallet.address,coin.symbol,user.username) * coinRes.exchangeRate ;
        totalRecieved += await userService.getTotalRecieved(wallet.address,coin.symbol,user.username) * coinRes.exchangeRate;
        walletsInfo.push(coinRes);
      }))
      let resBody = {coinList: walletsInfo, totalSent,totalRecieved,totalBalance,flatSymbol: user.currency[0].symbol}
      res.status(200).send(resBody);

    }catch(err){
      console.log(err);
      res.status(400).send(err.response);
    }
  }
  async setLanguage(req,res){
    const user = await UserService.findUser(parseInt(req.user.id));
    const newCurrency = flatFist.filter(el=> {
      return req.body.data === el.currency
    });
    userService.updateCurrency(user.id,newCurrency,(err,response)=> {
      if(err){
        res.status(400).send('Something Went Wrong');
        return
      }
      res.status(200).send({message:'Done',
      newCurrency})
    })
  }
  async transfer(req, res) {
    const user = await UserService.findUser(parseInt(req.user.id));
    // const minerFee = user.wallet[req.body.coin].minerFee;
    console.log(req.user,req.body);
    const minerFee = 0.0005
    console.log(user.wallet)
    const amount = parseFloat(req.body.amount);
    const address = req.body.toAddr;
    const coin = req.body.coin;
    const balanceRes = await userService.getBalance(coin,user.wallet[coin].address,user.username);
    const totalBalance = balanceRes.confirmBalance + balanceRes.unconfirmedBalance;
    const flatCurrency = 'INR'
    const flatSymbol = '₹'
    if(amount >= totalBalance ){
      res.status(400).send('Balance is Low');
      return;
    }
    if(amount > balanceRes.confirmBalance){
      res.status(400).send('Please wait for confirmations');
      return;
    }
    if(amount === balanceRes.confirmBalance){
      res.status(400).send('Please Take Care of Miners Fee');
      return
    }
    const addressRes = await userService.validateAddress(coin,address);
    if(!addressRes){
      res.status(400).send('Invalid Address');
      return;
    }
    const exchangeRate = await userService.getExchangeRate(coin,flatCurrency);

    const txObject = {
      transactionId: uuidv4()
    };
    txObject.coin = coin;
    txObject.toAddr= address;
    txObject.amountRequested = amount
    txObject.amountRequestedFlat= amount * exchangeRate;
    txObject.minerFee= minerFee
    txObject.minerFeeFlat= minerFee*exchangeRate;
    txObject.balance= totalBalance;
    txObject.balanceFlat= totalBalance * exchangeRate;
    txObject.newBalance= totalBalance - amount - minerFee;
    txObject.newBalanceFlat= txObject.newBalance * exchangeRate;
    txObject.flatSymbol = flatSymbol,
    txObject.flatCurrency=flatCurrency;
    txObject.OTP = messager.generateOTP(6);
    if(amount + minerFee <= (balanceRes.confirmBalance) )
    {
      cache.put(txObject.transactionId, {
        userId: req.user.id,
        ...txObject
      },1000* 60 * 3);
      await messager.sendOTPMobile(user.phone_number,'KOINTL','Please Complete transaction using '+txObject.OTP,txObject.OTP);
      const {OTP,...rest} = txObject;
      res.status(200).send(rest);
      return;
    } else {
      res.status(400).send('Something Went Wrong')
    }
  }
  async authorizeTransfer(req,res){
    const user = await UserService.findUser(parseInt(req.user.id));
    const transactionId = req.body.transactionId;
    const authCode = req.body.authCode;
    const transactionDetails = cache.get(transactionId);
    if(!transactionDetails){
      res.status(400).send('Transaction Has Expired');
      return;
    }
    if(user.id !== transactionDetails.userId){
      cache.del(transactionId);
      res.status(401).send('You are not Authorized to perform this transaction');
      return
    }
    const verifyOTP = await messager.verifyOTPMobile(user.phone_number,authCode);
    const authToken = verifyOTP.message;
    if(authToken !== 'otp_verified'){
      res.status(401).send('Invalid OTP');
      cache.del(transactionId);
      return;
    }

    UserService.authorizeTransaction(transactionDetails,user.wallet,(err,transaction)=>{
      if(err){
        console.log(err);
        res.status(500).send(err);
      }
      res.status(200).send(transaction)
    });
  }
}

export default UserController;
