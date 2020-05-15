const SplitPayment = artifacts.require('SplitPayment');

contract('SplitPayment', (accounts) => {
	let splitPayment = null;
	before(async () => {
		splitPayment = await SplitPayment.deployed();
	});

	it('Should send split payments', async () => {
		const recipients = [accounts[1], accounts[2], accounts[3]];
		const amounts = [20, 30, 40];
		const initialBalances = await Promise.all(recipients.map(recipient => {
			return web3.eth.getBalance(recipient);
		}));
		await splitPayment.send(recipients, amounts, {from: accounts[0], value: 90});
		const finalBalances = await Promise.all(recipients.map(recipient => {
			return web3.eth.getBalance(recipient);
		}));
		recipients.forEach((_item, i) => {
			const finalBalance = web3.utils.toBN(finalBalances[i]);
			const initialBalance = web3.utils.toBN(initialBalances[i]);
			assert(finalBalance.sub(initialBalance).toNumber() === amounts[i]);
		});
	});

	it('should not split payment if array length mismatch', async () => {
		const recipients = [accounts[1], accounts[2], accounts[3]];
		const amounts = [20, 30];
		try {
			await splitPayment.send(recipients, amounts, {from: accounts[0], value: 90});
		} catch (error) {
			assert(error.message.includes('to and amount arrays must have the same length'));
			return;
		}
		assert(false);
	});

	it('Should not send split payments if caller is not owner', async () => {
		const recipients = [accounts[1], accounts[2], accounts[3]];
		const amounts = [20, 30, 40];
		try {
			await splitPayment.send(recipients, amounts, {from: accounts[8], value: 90});
		} catch (error) {
			assert(error.message.includes('only owner can make this call'));
			return;
		}
		assert(false);
	});
});
