//This is to test the core functionality of blockchain, its just a mock
//This is basically a TDD - Test Driven Development

var Blockchain = require("./blockchain")
//We are going to use this blockchain application as a cryptocurrency application 
//so we are renaming the functionality as bitcoin
var bitcoin = new Blockchain()

//TestCase:1
//var newBlock = bitcoin.createNewBlock("fhkfhfjf789vnkj","ffdhsng806vko",7000);
//var newTransaction = bitcoin.createNewTransaction("parul","ravi",5000);
//console.log(bitcoin);

//TestCase:2
//var previousBlockhash = "92yhdkasjdh928ry95";
//var nonce = 823498273;
//var currentBlockdata = {
    //"sender":"revanth",
    //"recipient":"kumar",
    //"amount":3000
//}
//var hash = bitcoin.hashGenerator(previousBlockhash,currentBlockdata,nonce);
//console.log(hash);

//TestCase:3
// to check the genesis block
//console.log(bitcoin);

//TestCase:4
//here after executing the nonce value generated is 221673, also time can also be evaluated
//in which the nonce value is generated using stopwatch
//var previousBlockhash = "37269kjadkjasd2y3rjhasjdhas";
//var currentBlockdata = {
    //"sender":"revanth",
    //"recipient":"ravi",
    //"amount":6300
//}
//var nonce = bitcoin.proofOfWork(previousBlockhash,currentBlockdata);
//console.log(nonce);





