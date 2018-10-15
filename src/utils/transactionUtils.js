
class TransactionsUtils {
  sources() {
    return {
      "LTCTEST": "https://testnet.litecore.io/api/txs?address=ADDRESS",
      "BTCTEST": "https://test-insight.bitpay.com/api/txs?address=ADDRESS",
    }
  }
}

export default new TransactionsUtils();
