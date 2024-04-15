var express = require("express");
var path = require("path");
var logger = require("morgan");
var bodyParser = require("body-parser");
var router = express.Router();

var blockchain = require("./model/blockchain");
var network = require("./model/network");

blockchain.init();
network.init();

var app = express(),
  server = require("http").createServer(app);

const PORT = 4000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/", router);

router.get("/chain", function (req, res, next) {
  res.send(blockchain.getChain());
});
router.post("/mine", function (req, res, next) {
  var miningNode = req.headers.host;
  if (!network.nodeExists(miningNode)) {
    network.registerNode(miningNode);
  }
  res.send(blockchain.mine(req.headers.host));
});

router.get("/nodes", function (req, res, next) {
  res.send(network.getNodes());
});

router.post("/nodes/register", function (req, res, next) {
  res.send(network.registerNode(req.headers.host));
});

app.post("/transactions", function (req, res) {
  var { sender, receiver, amount } = req.body;
  if (!sender || !receiver || !amount || isNaN(amount)) {
    return res.status(400).json({ error: "Invalid transaction data" });
  }
  var transaction = blockchain.newTransaction(
    sender,
    receiver,
    parseFloat(amount)
  );
  res
    .status(200)
    .json({ message: "Transaction successful", transaction: transaction });
});

router.post("/checkChain", function (req, res, next) {
  res.send(blockchain.checkChain());
});

app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  console.log("App.js Error: ", err, req.url);
  res.render("error", {
    message: err.message,
    error: err,
  });
});

module.exports = app;
