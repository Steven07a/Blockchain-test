const SHA256 = require('crypto-js/sha256');
const EC =  require('elliptic').ec;
const ec = new EC('secp256k1');

class Transaction {
    constructor(fromAddress, toAddress, item) {
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.item = item;
    }

    calculateHash() {
        return SHA256(this.fromAddress + this.toAddress + this.item).toString();
    }

    signTransaction(signingKey) {
        if(signingKey.getPublic('hex') !== this.fromAddress) {
            throw new Error('You cannot sign transaction for other wallets.');
        }

        const hashTx = this.calculateHash();
        const sig = signingKey.sign(hashTx, 'base64');
        this.signature = sig.toDER('hex')
    }

    isValid() {
        //if its null then it was mined thus its valid 
        if(this.fromAddress === null) {
            return true;
        }

        if(!this.signature || this.signature.length === 0){
            throw new Error("No signature in this transaction");
        }

        const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');
        return publicKey.verify(this.calculateHash(), this.signature);
    }
}


class Block {
    constructor(timestamp, transactions, previousHash='') {
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
        //a number that basically lets us change/influence the hash without changing any important data
        this.nonce = 0;
    }

    calculateHash() {
        return SHA256(this.previousHash + this.timestamp + JSON.stringify(this.data) + this.nonce).toString();
    }

    mineBlock(difficulty) {
        while(this.hash.substring(0, difficulty) != Array(difficulty+1).join("0")) {
            this.nonce++;
            this.hash = this.calculateHash();
        }
        console.log("Block mined: " + this.hash);
    }

    hasValidTransactions() {
        for(const tx of this.transactions) {
            if(!tx.isValid()) {
                return false;
            }
        }
        return true;
    }
}


class BlockChain {
    constructor() {
        this.chain = [this.createGenesisBlock()];
        //sets a difficulty so that blocks take a longer time to mine
        this.difficulty = 2;
        this.pendingTransactions = [];
        this.miningReward = 100;
    }

    createGenesisBlock() {
        return new Block(0,"01/01/2021", "Genesis block", "0");
    }

    getLatestBlock() {
        return this.chain[this.chain.length-1];
    }

    minePendingTransactions(miningRewardAddress) {
        const rewardTx = new Transaction(null, miningRewardAddress, this.miningReward);
        this.pendingTransactions.push(rewardTx);

        let block = new Block(Date.now(), this.pendingTransactions, this.getLatestBlock().hash);
        block.mineBlock(this.difficulty);

        console.log("block mined");
        this.chain.push(block);

        this.pendingTransactions = [
            new Transaction(null, miningRewardAddress, this.miningReward)
        ];
    }

    addTransaction(transaction) {
        if(!transaction.fromAddress || !transaction.toAddress) {
            throw new Error('TRansaction must include form and to address');
        }

        if(!transaction.isValid()) {
            throw new Error('Cannot add invalid transaction to chain');
        }

        this.pendingTransactions.push(transaction);
    }

    getBalanceofAddress(address) {
        let balance = 0;
        for(const block of this.chain) {
            for(const trans of block.transactions) {
                if(trans.fromAddress === address) {
                    balance -= trans.item;
                }

                if(trans.toAddress === address) {
                    balance += trans.item;
                }
            }
        }
        return balance;
    }

    //verifies all blocks in the chain checking there hashes and checking they link to next block
    isChainValid() {
        for(let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i-1];

            if(!currentBlock.hasValidTransactions()) {
                return false;
            }

            //checks current block if the hashes dont match up then return false
            if(currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }

            //compares previous blocks hash again if something was tampered then this would be off returning false
            if(currentBlock.previousHash !== previousBlock.hash) {
                return false
            }
        }
        return true;
    }

}

module.exports.BlockChain = BlockChain;
module.exports.Transaction = Transaction;