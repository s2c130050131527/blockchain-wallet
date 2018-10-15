
class TransactionsUtils {
  sources() {
    return {
      "LTCTEST": "https://testnet.litecore.io/api/txs?address=ADDRESS",
      "BTCTEST": "https://test-insight.bitpay.com/api/txs?address=ADDRESS",
    }
  }
  confirmStatusFilter() {
    return {
      "values": ["Confirmed", "Unconfirmed", "Any"],
      "default": "Any",
      "confirmed": "Confirmed",
      "unconfirmed": "Unconfirmed"
    }
  }
  typeFilter() {
    return {
      "values": ["Received", "Sent", "All"],
      "default": "All"
    }
  }
}

export default new TransactionsUtils();
