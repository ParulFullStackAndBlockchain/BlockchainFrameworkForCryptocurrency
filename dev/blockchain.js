//This consists of core functionality of blockchain
var sha256 = require("sha256");
const currentNodeUrl = process.argv[3];
const uuid = require('uuid/v4');

function Blockchain(){
    this.chain = [];
    this.pendingTransactions = []; 
    this.networkNodes = [];
    this.currentNodeUrl = currentNodeUrl;
    this.createNewBlock("0","0",0);//genesis  
}

Blockchain.prototype.createNewBlock = function(hash,previousBlockHash,nonce){
    const newBlock = {
        index:this.chain.length+1,
        timestamp:Date.now(),
        //could be transactions(finance topic) or could be any other info(kyc etc)
        transactions:this.pendingTransactions,
        hash:hash,
        previousBlockhash:previousBlockHash,
        nonce:nonce
    }
    this.chain.push(newBlock);
    this.pendingTransactions = [];
    return newBlock;
}

Blockchain.prototype.createNewTransaction = function(senderCode,recepientCode,amount){
    const newTransaction = {
        sender:senderCode,
        recepient:recepientCode,
        amount:amount,
        transactionId:uuid().split('-').join('')
    }
    return newTransaction;
}

Blockchain.prototype.addTransactionToPendingTransactions = function(transactionObj){
    this.pendingTransactions.push(transactionObj);
}

Blockchain.prototype.getLastBlock = function(){
    return this.chain[this.chain.length - 1];
}

// nonce is an integer, currentBlockdata is in JSON format as transactions information coming 
//from frontend is in JSON format
Blockchain.prototype.hashGenerator = function(previousBlockhash,currentBlockdata,nonce){
    var dataAsString = previousBlockhash + nonce.toString() + JSON.stringify(currentBlockdata);
    var hash = sha256(dataAsString);
    return hash;
}

//here we are Generating nonce value by solving a cryptographic puzzle
//Also here currentBlockdata is nothing but transactions
Blockchain.prototype.proofOfWork = function(previousBlockhash,currentBlockdata){
    let nonce = 0;
    var hash = this.hashGenerator(previousBlockhash,currentBlockdata,nonce);
    while(hash.substring(0,2) !== "11")
    {
        nonce++;
        hash = this.hashGenerator(previousBlockhash,currentBlockdata,nonce);
        console.log(hash);
    }
    return nonce;
}

Blockchain.prototype.chainIsValid = function(blockchain){
    let validChain = true;
    for(var i = 1; i<blockchain.length; i++){
        const currentBlock = blockchain[i];   
        const prevBlock = blockchain[i-1];
        const blockHash = this.hashGenerator(prevBlock['hash'], {transactions: currentBlock['transactions'], index: currentBlock['index']}, currentBlock['nonce']);
        if(blockHash.substring(0,2) !== '11') validChain = false;
        if(currentBlock['previousBlockhash'] !== prevBlock['hash']) validChain = false;
    }

    const genesisBlock = blockchain[0];
    const correctNonce = genesisBlock['nonce'] === 0;
    const correctPreviousBlockHash = genesisBlock['previousBlockhash'] === '0';
    const correctHash = genesisBlock['hash'] ==='0';
    const correctTransactions = genesisBlock['transactions'].length === 0;

    if(!correctNonce || !correctPreviousBlockHash || !correctHash || !correctTransactions) validChain = false;
    return validChain;
}

Blockchain.prototype.getBlock = function(blockHash){
    let correctBlock = null;
    this.chain.forEach(block => {
        if(block.hash === blockHash){
            correctBlock = block;
        }
    });
    return correctBlock;
}


Blockchain.prototype.getTransaction = function(transactionId) {
	let correctTransaction = null;
	let correctBlock = null;

	this.chain.forEach(block => {
		block.transactions.forEach(transaction => {
			if (transaction.transactionId === transactionId) {
				correctTransaction = transaction;
				correctBlock = block;
			};
		});
	});

	return {
		transaction: correctTransaction,
		block: correctBlock
	};
};


Blockchain.prototype.getAddressData = function(address) {
	const addressTransactions = [];
	this.chain.forEach(block => {
		block.transactions.forEach(transaction => {
			if(transaction.sender === address || transaction.recepient === address) {
				addressTransactions.push(transaction);
			};
		});
	});

	let balance = 0;
	addressTransactions.forEach(transaction => {
        if (transaction.recepient === address) balance = eval(balance) + eval(transaction.amount);
        else if (transaction.sender === address) balance -= transaction.amount;
	});

	return {
		addressTransactions: addressTransactions,
		addressBalance: balance
	};
};


module.exports = Blockchain;