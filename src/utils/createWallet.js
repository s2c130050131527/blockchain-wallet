import bitcore from 'bitcore'

class WalletUtils{
    
    createWallet(){
        const randomBuffer= bitcore.crypto.Random.getRandomBuffer(32);
        const randomNumber = bitcore.crypto.BN.fromBuffer(randomBuffer);
        const privateKey = new bitcore.PrivateKey(randomNumber,bitcore.Networks.testnet);
        const WIF = privateKey.toWIF();
        const address = privateKey.toAddress();
        return {
            privateKey:privateKey.toString,WIF,address:address.toString()
        }
    }
}

export default new WalletUtils();