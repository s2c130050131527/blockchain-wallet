import Web3 from 'web3';
import EthereumTx from 'ethereumjs-tx';
import AddressValidator from 'wallet-address-validator';
import request from 'request-promise';
const testnet = 'https://ropsten.infura.io/v3/3327261b69ab40449a8a79b86a7aa54c';
class ETHWalletUtils{
    constructor() {
        this.Web3 = new Web3(new Web3.providers.HttpProvider(testnet));
    }
    
    
    async createWallet(){
        // const privateKey = this.Web3.eth.accounts.create().privateKey.substr(2);
        // let publicAddr;
        // const result = await this.Web3.eth.personal.importRawKey(privateKey, 'abcdefghij')
        // publicAddr = this.Web3.utils.toChecksumAddress(result);   
        const wallet = await this.Web3.eth.accounts.create();

        return {
            privateKey:wallet.privateKey,WIF: wallet.privateKey,address:wallet.address,minerFee:0.0005
        }
    }

    async getBalance(address){
      
        let myBalanceWei = await this.Web3.eth.getBalance(address);
        let myBalance = this.Web3.utils.fromWei(myBalanceWei.toString(), 'ether')
        console.log(myBalance)
        return {confirmBalance: parseFloat(myBalance), unconfirmedBalance:0}
      
    }

    async validateAddress(address){
        return AddressValidator.validate(address,'ETH','testnet');
    }

    async getCurrentGasPrices() {
        let response = await request({
            method:'GET',
            uri:'https://ethgasstation.info/json/ethgasAPI.json',
            json:true
        });
        let prices = {
          low: response.safeLow / 10,
          medium: response.average / 10,
          high: response.fast / 10
        }
        return prices
      }
    
    async getTotalRecieved(address,coin){
     return 0;
    }
    async getTotalSent(address,coin){
     return 0;
    }

    async createTransaction(minerFee,toAddr,address,privateKey,amount,cb){
        let nonce = await this.Web3.eth.getTransactionCount(address);
        let gasPrices = await this.getCurrentGasPrices();

        let details = {
            "to": toAddr,
            "value": this.Web3.utils.toHex( this.Web3.utils.toWei(amount.toString(), 'ether') ),
            "gas": 21000,
            "gasPrice": gasPrices.low * 1000000000, // converts the gwei price to wei
            "nonce": nonce,
            "chainId": 3 // EIP 155 chainId - mainnet: 1, rinkeby: 4
          }
        
        try{
        const transaction = new EthereumTx(details);
        transaction.sign(Buffer.from(privateKey.substr(2),'hex'));
        const serializedTransaction = transaction.serialize();
        this.Web3.eth.sendSignedTransaction('0x' + serializedTransaction.toString('hex'))
        .then(result => {
            cb(null,result);
            
        }).catch(err => {
            cb(err,null);
        })
        }catch(err){
            console.log(err,'-----------------');
            cb(err,null);
        }
        
    }

    async getTransactionCount(address){
        return await this.Web3.eth.getTransactionCount(address);
    }
}

export default new ETHWalletUtils();