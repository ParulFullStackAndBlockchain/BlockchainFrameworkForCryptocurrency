//This is to test the core functionality of blockchain, its just a mock
//This is basically a TDD - Test Driven Development

var Blockchain = require("./blockchain")
//We are going to use this blockchain application as a cryptocurrency application 
//so we are renaming the functionality as bitcoin
var bitcoin = new Blockchain()

//TestCase:1 - Craeting a new block and a new transaction to understand the output of console.log(bitcoin)
//var newBlock = bitcoin.createNewBlock("fhkfhfjf789vnkj","ffdhsng806vko",7000);
//var newTransaction = bitcoin.createNewTransaction("parul","ravi",5000);
//console.log(bitcoin);

//TestCase:2 - Testing hash
//var previousBlockhash = "92yhdkasjdh928ry95";
//var nonce = 823498273;
//var currentBlockdata = {
    //"sender":"revanth",
    //"recipient":"kumar",
    //"amount":3000
//}
//var hash = bitcoin.hashGenerator(previousBlockhash,currentBlockdata,nonce);
//console.log(hash);

//TestCase:3 - Check the output for genesis block
//console.log(bitcoin);

//TestCase:4 - Testing proofOfWork function by generating nonce
//Note: Generating nonce value and time in which the nonce value is generated using stopwatch can be used as a simulation of real time scenario 
//where miners compete for generating the nonce value to generate block and get rewards
//var previousBlockhash = "37269kjadkjasd2y3rjhasjdhas";
//var currentBlockdata = {
    //"sender":"revanth",
    //"recipient":"ravi",
    //"amount":6300
//}
//var nonce = bitcoin.proofOfWork(previousBlockhash,currentBlockdata);
//console.log(nonce);





