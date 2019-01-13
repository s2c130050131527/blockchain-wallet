
class TransactionsUtils {
	sources() {
		return {
			'LTC': 'https://insight.litecore.io/api/txs?address=ADDRESS',
			'BTC': 'https://insight.bitpay.com/api/txs?address=ADDRESS',
			'XRP': 'http://testnet.data.api.ripple.com/v2/accounts/ADDRESS/transactions',
			'ETH': 'https://www.etherchain.org/account/ADDRESS/txs?draw=1&start=0&length=100',
			'LOBSTEX': '',
		};
	}
	confirmStatusFilter() {
		return {
			'values': ['Confirmed', 'Unconfirmed', 'Any'],
			'default': 'Any',
			'confirmed': 'Confirmed',
			'unconfirmed': 'Unconfirmed'
		};
	}
	typeFilter() {
		return {
			'values': ['Received', 'Sent', 'All'],
			'default': 'All'
		};
	}
}

export default new TransactionsUtils();
