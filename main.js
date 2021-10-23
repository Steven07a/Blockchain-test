const {BlockChain, Transaction} = require('./blockchain');
const EC =  require('elliptic').ec;
const ec = new EC('secp256k1');

const myKey = ec.keyFromPrivate('8efb792536681ff0f467b5f9a53ad441000d6302151a3baae08adbe4675c7e5c');
const myWalletAddress = myKey.getPublic('hex');

let testCoin = new BlockChain();

const tx1 = new Transaction(myWalletAddress, 'public key goes here', 10);
tx1.signTransaction(myKey);
testCoin.addTransaction(tx1);

// testCoin.createTransaction(new Transaction('Address1', 'Address2', 100));
// testCoin.createTransaction(new Transaction('Address2', 'Address1', 50));

console.log('\nStarting the miner...');
testCoin.minePendingTransactions(myWalletAddress);

console.log('\nBalanace of steven is', testCoin.getBalanceofAddress(myWalletAddress));

console.log("is chain valid?", testCoin.isChainValid());

testCoin.chain[1].transactions[0].item = 1;

console.log("is chain valid?", testCoin.isChainValid());

// console.log('\nStarting the miner again...');
// testCoin.minePendingTransactions('steven-address');
// console.log('\nBalanace of steven is', testCoin.getBalanceofAddress('steven-address'));

// console.log("Mining block 1 ...");
// testCoin.addBlock(new Block(1,"01/02/2021", { amount: 4 })); 
// console.log("Mining block 1 ...");
// testCoin.addBlock(new Block(2,"01/03/2021", { amount: 10 })); 

// console.log(JSON.stringify(testCoin, null, 4));
// console.log("is blockchain valid? " + testCoin.isChainValid());

// //testing a manual change in the block plus trying to change its hash
// testCoin.chain[1].data = { amount: 1000 };
// testCoin.chain[1].hash = testCoin.chain[1].calculateHash();
// //printing out chain and expecting it to be invalid
// console.log(JSON.stringify(testCoin, null, 4));
// console.log("is blockchain valid? " + testCoin.isChainValid())