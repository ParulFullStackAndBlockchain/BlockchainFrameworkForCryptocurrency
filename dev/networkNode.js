//This consists of the networking part of blockchain

var expressFramework = require('express')
var bitcoinApp = new expressFramework()

var port = process.argv[2];
const rp = require('request-promise');
var Blockchain = require("./blockchain")
//We are going to use this blockchain application as a cryptocurrency application 
//so we are renaming the functionality as bitcoin
var bitcoin = new Blockchain()

const bodyParser = require('body-parser');
bitcoinApp.use(bodyParser.json());
bitcoinApp.use(bodyParser.urlencoded({extended: false}));

bitcoinApp.get('/',function(req,res){
    res.send("this is the node of miner : " +port);
});

bitcoinApp.get('/blockchain',function(req,res){
    res.send(bitcoin);//public ledger  
});

bitcoinApp.post('/transaction',function(req,res){
    const newTransaction = req.body;
    bitcoin.addTransactionToPendingTransactions(newTransaction);
    res.json ({note: 'Transaction will be added in the next block'});
});

bitcoinApp.post('/transaction/broadcast',function(req,res){
    const newTransaction = bitcoin.createNewTransaction(req.body.sender, req.body.recipient, req.body.amount);
    bitcoin.addTransactionToPendingTransactions(newTransaction);
    
    const requestPromises = [];
    bitcoin.networkNodes.forEach(networkNodeUrl => {
        const requestOptions = {
            uri : networkNodeUrl + '/transaction',
            method : 'POST',
            body : newTransaction,
            json : true
        };
        requestPromises.push(rp(requestOptions));
    });

    Promise.all(requestPromises)
    .then(data =>{
        res.json({note : 'Transaction created and broadcasted successfully.'});
    });

});

bitcoinApp.get('/mine',function(req,res){

    const lastBlock = bitcoin.getLastBlock();
    const previousBlockHash = lastBlock['hash'];
    const currentBlockData = {
        transactions : bitcoin.pendingTransactions,
        index: lastBlock['index'] + 1
    };
    const nonce = bitcoin.proofOfWork(previousBlockHash,currentBlockData);
    const blockHash = bitcoin.hashGenerator(previousBlockHash,currentBlockData,nonce);
    const newBlock = bitcoin.createNewBlock(blockHash, previousBlockHash,nonce);

    const requestPromises = [];
    bitcoin.networkNodes.forEach(networkNodeUrl => {
        const requestOptions = {
            uri : networkNodeUrl + '/receive-new-block',
            method : 'POST',
            body : {newBlock: newBlock},
            json : true
        };
        requestPromises.push(rp(requestOptions));
    });

    Promise.all(requestPromises)
    .then(data => {
        const requestOptions = {
            uri : bitcoin.currentNodeUrl + '/transaction/broadcast',
            method : 'POST',
            body : {
                amount: 12.5,
                sender: "00",
                recipient: bitcoin.currentNodeUrl
            },
            json : true
        };
        return rp(requestOptions);
    })
    .then(data =>{
        res.json({
            note : 'New block mined & broadcasted successfully',
            block: newBlock
        });
    });
});

bitcoinApp.post('/receive-new-block',function(req,res){
    const newBlock = req.body.newBlock;
    const lastBlock = bitcoin.getLastBlock();
    const correctHash = lastBlock.hash === newBlock.previousBlockhash;   
    const correctIndex = lastBlock['index'] + 1 === newBlock['index'];
    if(correctHash && correctIndex){
        bitcoin.chain.push(newBlock);
        bitcoin.pendingTransactions = [];
        res.json({
            note: 'New block received and accepted.',
            newBlock: newBlock
        });
    }else{
        res.json({
            note: 'New block rejected.',
            newBlock: newBlock
        });
    }
});

bitcoinApp.get('/consensus',function(req,res){

    const requestPromises = [];
    bitcoin.networkNodes.forEach(networkNodeUrl => {
        const requestOptions = {
            uri : networkNodeUrl + '/blockchain',
            method : 'GET',
            json : true
        };
        requestPromises.push(rp(requestOptions));
    });
       
        Promise.all(requestPromises)
        .then(blockchains => {
            const currentChainLength = bitcoin.chain.length;
            let maxChainLength = currentChainLength; 
            let newLongestchain = null;
            let newPendingTransactions = null;  
            blockchains.forEach(blockchain => {
                if(blockchain.chain.length > maxChainLength){
                    maxChainLength = blockchain.chain.length;
                    newLongestchain = blockchain.chain;
                    newPendingTransactions = blockchain.pendingTransactions;
                };
            });

            if(!newLongestchain ||(newLongestchain && !bitcoin.chainIsValid(newLongestchain))){
                res.json({
                    note: 'Current chain has not been replaced.',
                    chain: bitcoin.chain
                });
            }
            else{
                bitcoin.chain = newLongestchain;
                bitcoin.pendingTransactions = newPendingTransactions;
                res.json({
                    note: 'Current chain has been replaced.',
                    chain: bitcoin.chain
                });
            }   
               
        });       
});

bitcoinApp.post('/register-broadcast-node',function(req,res){
    const newNodeUrl = req.body.newNodeUrl;
    if(bitcoin.networkNodes.indexOf(newNodeUrl) == -1) bitcoin.networkNodes.push(newNodeUrl);

    const regNodesPromises = [];
    bitcoin.networkNodes.forEach(networkNodeUrl => {
        const requestOptions = {
            uri : networkNodeUrl + '/register-node',
            method : 'POST',
            body : {newNodeUrl: newNodeUrl},
            json : true
        };
        regNodesPromises.push(rp(requestOptions));
    });

    Promise.all(regNodesPromises)
    .then(data => {
        const bulkRegistrationOptions = {
            uri : newNodeUrl + '/register-nodes-bulk',
            method : 'POST',
            body : {allNetworkNodes: [...bitcoin.networkNodes, bitcoin.currentNodeUrl]},
            json : true
        };
        return rp(bulkRegistrationOptions);
    })
    .then(data =>{
        res.json({note : 'New node registered with network successfully.'});
    });
});

bitcoinApp.post('/register-node',function(req,res){
    const newNodeUrl = req.body.newNodeUrl;
    const nodeNotAlreadyPresent = bitcoin.networkNodes.indexOf(newNodeUrl) == -1;
    const notCurrentNode = bitcoin.currentNodeUrl !== newNodeUrl;
    if(nodeNotAlreadyPresent && notCurrentNode)
    {
        bitcoin.networkNodes.push(newNodeUrl);
        res.json({note : 'New node registered successfully.'});
    }
    else{
        res.json({note : 'New node is not registered successfully.'});
    }
});

bitcoinApp.post('/register-nodes-bulk',function(req,res){
    const allNetworkNodes = req.body.allNetworkNodes;
    allNetworkNodes.forEach(networkNodeUrl =>{
        const nodeNotAlreadyPresent = bitcoin.networkNodes.indexOf(networkNodeUrl) == -1;
        const notCurrentNode = bitcoin.currentNodeUrl !== networkNodeUrl;
        if(nodeNotAlreadyPresent && notCurrentNode) bitcoin.networkNodes.push(networkNodeUrl);
    });
    res.json({note : 'Bulk registration successful'});
});

bitcoinApp.get('/block/:blockHash',function(req,res){
    const blockHash = req.params.blockHash;
    const correctBlock = bitcoin.getBlock(blockHash);
    res.json({
        block: correctBlock
    });
});

// get transaction by transactionId
bitcoinApp.get('/transaction/:transactionId', function(req, res) {
	const transactionId = req.params.transactionId;
	const trasactionData = bitcoin.getTransaction(transactionId);
	res.json({
		transaction: trasactionData.transaction,
		block: trasactionData.block
	});
});

// get address by address
bitcoinApp.get('/address/:address', function(req, res) {
	const address = req.params.address;
	const addressData = bitcoin.getAddressData(address);
	res.json({
		addressData: addressData
	});
});

bitcoinApp.get('/block-explorer',function(req,res){
    res.sendFile('./block-explorer/index.html',{ root: __dirname});
});

bitcoinApp.listen(port, function(){
    console.log("Miner is active on this port :"+ port);
});