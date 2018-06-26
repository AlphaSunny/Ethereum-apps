var Taobao = artifacts.require("./Taobao.sol");

// test suite
contract('Taobao', function(accounts){
  var TaobaoInstance;
  var seller = accounts[1];
  var buyer = accounts[2];
  var MerchName1 = "Merch 1";
  var MerchDescription1 = "Description for Merch 1";
  var MerchPrice1 = 10;
  var MerchName2 = "Merch 2";
  var MerchDescription2 = "Description for Merch 2";
  var MerchPrice2 = 20;
  var sellerBalanceBeforeBuy, sellerBalanceAfterBuy;
  var buyerBalanceBeforeBuy, buyerBalanceAfterBuy;

  it("should be initialized with empty values", function() {
    return Taobao.deployed().then(function(instance) {
      TaobaoInstance = instance;
      return TaobaoInstance.getNumberOfMerchs();
    }).then(function(data) {
      assert.equal(data.toNumber(), 0, "number of Merchs must be zero");
      return TaobaoInstance.getMerchsForSale();
    }).then(function(data){
      assert.equal(data.length, 0, "there shouldn't be any Merch for sale");
    });
  });

  // sell a first Merch
  it("should let us sell a first Merch", function() {
    return Taobao.deployed().then(function(instance){
      TaobaoInstance = instance;
      return TaobaoInstance.sellMerch(
        MerchName1,
        MerchDescription1,
        web3.toWei(MerchPrice1, "ether"),
        {from: seller}
      );
    }).then(function(receipt){
      // check event
      assert.equal(receipt.logs.length, 1, "one event should have been triggered");
      assert.equal(receipt.logs[0].event, "LogSellMerch", "event should be LogSellMerch");
      assert.equal(receipt.logs[0].args._id.toNumber(), 1, "id must be 1");
      assert.equal(receipt.logs[0].args._seller, seller, "event seller must be " + seller);
      assert.equal(receipt.logs[0].args._name, MerchName1, "event Merch name must be " + MerchName1);
      assert.equal(receipt.logs[0].args._price.toNumber(), web3.toWei(MerchPrice1, "ether"), "event Merch price must be " + web3.toWei(MerchPrice1, "ether"));

      return TaobaoInstance.getNumberOfMerchs();
    }).then(function(data) {
      assert.equal(data, 1, "number of Merchs must be one");

      return TaobaoInstance.getMerchsForSale();
    }).then(function(data) {
      assert.equal(data.length, 1, "there must be one Merch for sale");
      assert.equal(data[0].toNumber(), 1, "Merch id must be 1");

      return TaobaoInstance.Merchs(data[0]);
    }).then(function(data) {
      assert.equal(data[0].toNumber(), 1, "Merch id must be 1");
      assert.equal(data[1], seller, "seller must be " + seller);
      assert.equal(data[2], 0x0, "buyer must be empty");
      assert.equal(data[3], MerchName1, "Merch name must be " + MerchName1);
      assert.equal(data[4], MerchDescription1, "Merch description must be " + MerchDescription1);
      assert.equal(data[5].toNumber(), web3.toWei(MerchPrice1, "ether"), "Merch price must be " + web3.toWei(MerchPrice1, "ether"));
    });
  });

  // sell a second Merch
  it("should let us sell a second Merch", function() {
    return Taobao.deployed().then(function(instance){
      TaobaoInstance = instance;
      return TaobaoInstance.sellMerch(
        MerchName2,
        MerchDescription2,
        web3.toWei(MerchPrice2, "ether"),
        {from: seller}
      );
    }).then(function(receipt){
      // check event
      assert.equal(receipt.logs.length, 1, "one event should have been triggered");
      assert.equal(receipt.logs[0].event, "LogSellMerch", "event should be LogSellMerch");
      assert.equal(receipt.logs[0].args._id.toNumber(), 2, "id must be 2");
      assert.equal(receipt.logs[0].args._seller, seller, "event seller must be " + seller);
      assert.equal(receipt.logs[0].args._name, MerchName2, "event Merch name must be " + MerchName2);
      assert.equal(receipt.logs[0].args._price.toNumber(), web3.toWei(MerchPrice2, "ether"), "event Merch price must be " + web3.toWei(MerchPrice2, "ether"));

      return TaobaoInstance.getNumberOfMerchs();
    }).then(function(data) {
      assert.equal(data, 2, "number of Merchs must be two");

      return TaobaoInstance.getMerchsForSale();
    }).then(function(data) {
      assert.equal(data.length, 2, "there must be two Merchs for sale");
      assert.equal(data[1].toNumber(), 2, "Merch id must be 2");

      return TaobaoInstance.Merchs(data[1]);
    }).then(function(data) {
      assert.equal(data[0].toNumber(), 2, "Merch id must be 2");
      assert.equal(data[1], seller, "seller must be " + seller);
      assert.equal(data[2], 0x0, "buyer must be empty");
      assert.equal(data[3], MerchName2, "Merch name must be " + MerchName2);
      assert.equal(data[4], MerchDescription2, "Merch description must be " + MerchDescription2);
      assert.equal(data[5].toNumber(), web3.toWei(MerchPrice2, "ether"), "Merch price must be " + web3.toWei(MerchPrice2, "ether"));
    });
  });

  // buy the first Merch
  it("should buy an Merch", function(){
    return Taobao.deployed().then(function(instance) {
      TaobaoInstance = instance;
      // record balances of seller and buyer before the buy
      sellerBalanceBeforeBuy = web3.fromWei(web3.eth.getBalance(seller), "ether").toNumber();
      buyerBalanceBeforeBuy = web3.fromWei(web3.eth.getBalance(buyer), "ether").toNumber();
      return TaobaoInstance.buyMerch(1, {
        from: buyer,
        value: web3.toWei(MerchPrice1, "ether")
      });
    }).then(function(receipt){
      assert.equal(receipt.logs.length, 1, "one event should have been triggered");
      assert.equal(receipt.logs[0].event, "LogBuyMerch", "event should be LogBuyMerch");
      assert.equal(receipt.logs[0].args._id.toNumber(), 1, "Merch id must be 1");
      assert.equal(receipt.logs[0].args._seller, seller, "event seller must be " + seller);
      assert.equal(receipt.logs[0].args._buyer, buyer, "event buyer must be " + buyer);
      assert.equal(receipt.logs[0].args._name, MerchName1, "event Merch name must be " + MerchName1);
      assert.equal(receipt.logs[0].args._price.toNumber(), web3.toWei(MerchPrice1, "ether"), "event Merch price must be " + web3.toWei(MerchPrice1, "ether"));

      // record balances of buyer and seller after the buy
      sellerBalanceAfterBuy = web3.fromWei(web3.eth.getBalance(seller), "ether").toNumber();
      buyerBalanceAfterBuy = web3.fromWei(web3.eth.getBalance(buyer), "ether").toNumber();

      // check the effect of buy on balances of buyer and seller, accounting for gas
      assert(sellerBalanceAfterBuy == sellerBalanceBeforeBuy + MerchPrice1, "seller should have earned " + MerchPrice1 + " ETH");
      assert(buyerBalanceAfterBuy <= buyerBalanceBeforeBuy - MerchPrice1, "buyer should have spent " + MerchPrice1 + " ETH");

      return TaobaoInstance.getMerchsForSale();
    }).then(function(data){
      assert.equal(data.length, 1, "there should now be only 1 Merch left for sale");
      assert.equal(data[0].toNumber(), 2, "Merch 2 should be the only Merch left for sale");

      return TaobaoInstance.getNumberOfMerchs();
    }).then(function(data){
      assert.equal(data.toNumber(), 2, "there should still be 2 Merchs in total");
    });
  });
});
