//This consists of core functionality of blockchain
//OR core functionality of a decentralized application in Javascript

var sha256 = require("sha256");//sha256 package is installed to do hashing
const currentNodeUrl = process.argv[3];
const uuid = require('uuid/v4');//install UUID package

function Blockchain(){
    //parent function constructor
    this.chain = [];
    this.pendingTransactions = []; 
    this.networkNodes = [];
    this.currentNodeUrl = currentNodeUrl;
    this.createNewBlock("0","0",0);//genesis block:there will be no transactions,any value can be assumed for previousblockhash here "0" is considered
}

//this function will create blocks 
//<name of constructor>.prototype.<name of child function>
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

//this function is to create new a transaction
Blockchain.prototype.createNewTransaction = function(senderCode,recepientCode,amount){
    const newTransaction = {
        sender:senderCode,
        recepient:recepientCode,
        amount:amount,
        transactionId:uuid().split('-').join('')
    }
    return newTransaction;
}

//When transaction is received in one node/miner it is first added to the pending transactions list
Blockchain.prototype.addTransactionToPendingTransactions = function(transactionObj){
    this.pendingTransactions.push(transactionObj);
}

Blockchain.prototype.getLastBlock = function(){
    return this.chain[this.chain.length - 1];
}

//This function is used twice once for creating nonce and then to get the hash value or encrypted value of complete block
//Note: previousblockhash for first block : any value can be assumed for previousblockhash as it is not created dynamically,
//currentBlockdata is in JSON format as transactions information coming from frontend is in JSON format,
//nonce is an integer
Blockchain.prototype.hashGenerator = function(previousBlockhash,currentBlockdata,nonce){
    var dataAsString = previousBlockhash + nonce.toString() + JSON.stringify(currentBlockdata);
    var hash = sha256(dataAsString);
    return hash; //current block hash
}

//This function is to Generate nonce value by solving a cryptographic puzzle. 
//Proof of work is used for various purposes => 1.)nonce, 2.)to create hash of block which establishes security, 
//3.)provides equal opportunities to the miners to generate or mine the block using the skill set of cracking the cryotographic puzzle
//currentBlockdata is nothing but transactions
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