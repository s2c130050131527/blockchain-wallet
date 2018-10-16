import UserService from './user.service';
import wallet from '../../utils/createWallet'
import userService from './user.service';
import CoinList from '../../utils/CoinList';
import TransactionsUtils from '../../utils/transactionUtils';
import cache from 'memory-cache';
import uuidv4 from 'uuid/v4';
import flatFist from '../../utils/FlatList';
import request from "request-promise";
var totp = require('notp').totp;
var base32 = require('hi-base32');

class UserController {
  async getBalance(req, res) {
    const user = await UserService.findUser(parseInt(req.user.id));
    const address = user.wallet[req.params.coin].address;
    console.log(user.currency);
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
    const balanceRes = await UserService.getBalance(req.params.coin, address);
    resBody.balance = (balanceRes.confirmBalance + balanceRes.unconfirmedBalance);
    const flatCurrency = user.currency[0].currency;
    console.log(flatCurrency)
    resBody.exchangeRate = await UserService.getExchangeRate(req.params.coin,flatCurrency);
    resBody.flatBalance = resBody.balance * resBody.exchangeRate;
    resBody.flatCurrency = flatCurrency;
    resBody.flatSymbol = user.currency[0].symbol;
    resBody.totalMoneySent = await userService.getTotalSent(address,req.params.coin);
    resBody.totalMoneyRecieved = await userService.getTotalRecieved(address,req.params.coin);
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
      let txs = await request(options);
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
    const type=['All','Recieved','Sent','Confirmed','Unconfirmed'];
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
        const balanceRes = await userService.getBalance(coin.symbol,wallet.address);
        coinRes.balance = (balanceRes.confirmBalance + balanceRes.unconfirmedBalance)
        coinRes.confirmBalance = balanceRes.confirmBalance;
        coinRes.flatCurrency = user.currency[0].currency;
        coinRes.exchangeRate = await userService.getExchangeRate(coin.symbol,coinRes.flatCurrency);
        coinRes.balanceInCurrency = coinRes.exchangeRate * coinRes.balance;
        totalBalance += coinRes.balanceInCurrency;
        totalSent += await userService.getTotalSent(wallet.address,coin.symbol) * coinRes.exchangeRate ;
        totalRecieved += await userService.getTotalRecieved(wallet.address,coin.symbol) * coinRes.exchangeRate;
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
    const balanceRes = await userService.getBalance(coin,user.wallet[coin].address);
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
    if(amount + minerFee <= (balanceRes.confirmBalance) )
    {
      cache.put(txObject.transactionId, {
        userId: req.user.id,
        ...txObject
      },1000* 60 * 3);
      res.status(200).send(txObject);
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
    const authToken = totp.verify(authCode,base32.decode.asBytes(user.secret_text));
    if(!authToken){
      res.status(401).send('You are not Authorized to perform this transaction');
      cache.del(transactionId);
      return;
    }

    UserService.authorizeTransaction(transactionDetails,user.wallet,(err,transaction)=>{
      if(err){
        res.status(500).send(err);
      }
      res.status(200).send(transaction)
    });
  }
}

export default UserController;
