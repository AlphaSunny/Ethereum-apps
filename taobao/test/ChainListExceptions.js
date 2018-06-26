// contract to be tested
var Taobao = artifacts.require("./Taobao.sol");

// test suite
contract("Taobao", function(accounts){
  var TaobaoInstance;
  var seller = accounts[1];
  var buyer = accounts[2];
  var MerchName = "Merch 1";
  var MerchDescription = "Description for Merch 1";
  var MerchPrice = 10;

  // no Merch for sale yet
  it("should throw an exception if you try to buy an Merch when there is no Merch for sale yet", function() {
    return Taobao.deployed().then(function(instance) {
      TaobaoInstance = instance;
      return TaobaoInstance.buyMerch(1, {
        from: buyer,
        value: web3.toWei(MerchPrice, "ether")
      });
    }).then(assert.fail)
    .catch(function(error){
      assert(true);
    }).then(function() {
      return TaobaoInstance.getNumberOfMerchs();
    }).then(function(data) {
      assert.equal(data.toNumber(), 0, "number of Merchs must be 0");
    });
  });

  // buy an Merch that does not exist
  it("should throw an exception if you try to buy an Merch that does not exist", function(){
    return Taobao.deployed().then(function(instance){
      TaobaoInstance = instance;
      return TaobaoInstance.sellMerch(MerchName, MerchDescription, web3.toWei(MerchPrice, "ether"), { from: seller });
    }).then(function(receipt){
      return TaobaoInstance.buyMerch(2, {from: seller, value: web3.toWei(MerchPrice, "ether")});
    }).then(assert.fail)
    .catch(function(error) {
      assert(true);
    }).then(function() {
      return TaobaoInstance.Merchs(1);
    }).then(function(data) {
      assert.equal(data[0].toNumber(), 1, "Merch id must be 1");
      assert.equal(data[1], seller, "seller must be " + seller);
      assert.equal(data[2], 0x0, "buyer must be empty");
      assert.equal(data[3], MerchName, "Merch name must be " + MerchName);
      assert.equal(data[4], MerchDescription, "Merch description must be " + MerchDescription);
      assert.equal(data[5].toNumber(), web3.toWei(MerchPrice, "ether"), "Merch price must be " + web3.toWei(MerchPrice, "ether"));
    });
  });

  // buying an Merch you are selling
  it("should throw an exception if you try to buy your own Merch", function() {
    return Taobao.deployed().then(function(instance){
      TaobaoInstance = instance;

      return TaobaoInstance.buyMerch(1, {from: seller, value: web3.toWei(MerchPrice, "ether")});
    }).then(assert.fail)
    .catch(function(error){
      assert(true);
    }).then(function() {
      return TaobaoInstance.Merchs(1);
    }).then(function(data) {
      assert.equal(data[0].toNumber(), 1, "Merch id must be 1");
      assert.equal(data[1], seller, "seller must be " + seller);
      assert.equal(data[2], 0x0, "buyer must be empty");
      assert.equal(data[3], MerchName, "Merch name must be " + MerchName);
      assert.equal(data[4], MerchDescription, "Merch description must be " + MerchDescription);
      assert.equal(data[5].toNumber(), web3.toWei(MerchPrice, "ether"), "Merch price must be " + web3.toWei(MerchPrice, "ether"));
    });
  });

  // incorrect value
  it("should throw an exception if you try to buy an Merch for a value different from its price", function() {
    return Taobao.deployed().then(function(instance){
      TaobaoInstance = instance;
      return TaobaoInstance.buyMerch(1, {from: buyer, value: web3.toWei(MerchPrice + 1, "ether")});
    }).then(assert.fail)
    .catch(function(error){
      assert(true);
    }).then(function() {
      return TaobaoInstance.Merchs(1);
    }).then(function(data) {
      assert.equal(data[0].toNumber(), 1, "Merch id must be 1");
      assert.equal(data[1], seller, "seller must be " + seller);
      assert.equal(data[2], 0x0, "buyer must be empty");
      assert.equal(data[3], MerchName, "Merch name must be " + MerchName);
      assert.equal(data[4], MerchDescription, "Merch description must be " + MerchDescription);
      assert.equal(data[5].toNumber(), web3.toWei(MerchPrice, "ether"), "Merch price must be " + web3.toWei(MerchPrice, "ether"));
    });
  });

  // Merch has already been sold
  it("should throw an exception if you try to buy an Merch that has already been sold", function() {
    return Taobao.deployed().then(function(instance){
      TaobaoInstance = instance;
      return TaobaoInstance.buyMerch(1, {from: buyer, value: web3.toWei(MerchPrice, "ether")});
    }).then(function(){
      return TaobaoInstance.buyMerch(1, {from: web3.eth.accounts[0], value: web3.toWei(MerchPrice, "ether")});
    }).then(assert.fail)
    .catch(function(error){
      assert(true);
    }).then(function() {
      return TaobaoInstance.Merchs(1);
    }).then(function(data) {
      assert.equal(data[0].toNumber(), 1, "Merch id must be 1");
      assert.equal(data[1], seller, "seller must be " + seller);
      assert.equal(data[2], buyer, "buyer must be " + buyer);
      assert.equal(data[3], MerchName, "Merch name must be " + MerchName);
      assert.equal(data[4], MerchDescription, "Merch description must be " + MerchDescription);
      assert.equal(data[5].toNumber(), web3.toWei(MerchPrice, "ether"), "Merch price must be " + web3.toWei(MerchPrice, "ether"));
    });
  });
});
