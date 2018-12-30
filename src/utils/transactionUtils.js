
class TransactionsUtils {
	sources() {
		return {
			'LTCTEST': 'https://testnet.litecore.io/api/txs?address=ADDRESS',
			'BTCTEST': 'https://test-insight.bitpay.com/api/txs?address=ADDRESS',
			'XRPTEST': 'http://testnet.data.api.ripple.com/v2/accounts/ADDRESS/transactions',
			'ETHTEST': 'https://www.etherchain.org/account/ADDRESS/txs?draw=1&start=0&length=100',
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
