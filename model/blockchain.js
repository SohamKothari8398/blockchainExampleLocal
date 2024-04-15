var addressUtilities = require("../utils/address");
var arrayUtilities = require("../utils/array");
var validator = require("../utils/validator");

var blockchain = function blockchain() {
  var self = this;

  this.init = init;
  this.newBlock = newBlock;
  this.newTransaction = newTransaction;
  this.getChain = getChain;
  this.checkChain = checkChain;
  this.mine = mine;

  this.chain;
  this.currentTransactions;

  function init() {
    /*
     *  initialize the blockchain, creating a new empty chain,
     *  an empty transactions list and creating the first block
     */
    self.chain = [];
    self.currentTransactions = [];
    self.newBlock(100, 1);
  }

  function getChain() {
    /*
     *  returns the chain
     */
    return self.chain;
  }

  function mine(miner) {
    /*
     *  implements the mining function. simple as is, it just
     *  creates a new transaction with "sender" 0 to show that
     *  this is a mined block.
     */
    var lastBlock = self.chain[self.chain.length - 1];
    var transaction = newTransaction(0, miner, 1);
    var proof = validator.generateProof(transaction);
    var previousHash = validator.calculateHash(lastBlock.transaction[0]);
    return newBlock(proof, previousHash);
  }

  function newBlock(proof, previousHash) {
    /*
     *  Generate a new blocks and adds it to the chain
     */
    var block = {
      index: self.chain.length + 1,
      timestamp: new Date().getTime(),
      transaction: self.currentTransactions,
      proof: proof,
      previousHash: previousHash,
    };
    self.currentTransactions = [];
    self.chain.push(block);
    return block;
  }

  function newTransaction(sender, receiver, amount) {
    /*
     *  Generate a new transaction
     */
    var transaction = {
      sender: sender,
      receiver: receiver,
      amount: amount,
    };
    self.currentTransactions.push(transaction);
    return transaction;
  }

  /* Loops through all blocks except the genesis block.
  Checks if current block's hash is valid based on its data.
  Checks if previous hash in current block matches the actual hash of the last block.
  Updates lastBlock for next iteration. */
  function checkChain() {
    var chain = this.chain;
    var lastBlock = chain[0]; // Genesis block is always the first block

    for (var i = 1; i < chain.length; i++) {
      var currentBlock = chain[i];
      if (!validator.calculateHash(currentBlock) === currentBlock.hash) {
        console.error("Current Block Hash is invalid");
        return []; // Return empty chain if hash is invalid
      }
      if (!validator.calculateHash(lastBlock) === currentBlock.previousHash) {
        console.error("Previous Block Hash mismatch");
        return []; // Return empty chain if previous hash mismatch
      }
      lastBlock = currentBlock;
    }
    return chain; // Return the entire chain if all checks pass
  }
  if (blockchain.caller != blockchain.getInstance) {
    throw new Error("This object cannot be instanciated");
  }
};

blockchain.instance = null;
blockchain.getInstance = function () {
  if (this.instance === null) {
    this.instance = new blockchain();
  }
  return this.instance;
};

module.exports = blockchain.getInstance();
