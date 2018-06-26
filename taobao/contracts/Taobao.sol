pragma solidity ^0.4.18;

import "./Ownable.sol";

contract Taobao is Ownable {
  // 商品类
  struct Merch {
    uint id;
    address seller;
    address buyer;
    string name;
    string description;
    uint256 price;
  }

  // state variables
  mapping (uint => Merch) public Merchs;
  uint MerchCounter;

  // events可以创造出对应操作的log
  event LogSellMerch(
    uint indexed _id,
    address indexed _seller,
    string _name,
    uint256 _price
  );
  event LogBuyMerch(
    uint indexed _id,
    address indexed _seller,
    address indexed _buyer,
    string _name,
    uint256 _price
  );

  // deactivate the contract
  function kill() public onlyOwner {
    selfdestruct(owner);
  }

  // sell an Merch
  function sellMerch(string _name, string _description, uint256 _price) public {
    // a new Merch
    MerchCounter++;

    // store this merch
    Merchs[MerchCounter] = Merch(
      MerchCounter,
      msg.sender,
      0x0,
      _name,
      _description,
      _price
    );

    emit LogSellMerch(MerchCounter, msg.sender, _name, _price);
  }

  // fetch the number of Merchs in the contract
  function getNumberOfMerchs() public view returns (uint) {
    return MerchCounter;
  }

  // fetch and return all Merch IDs for Merchs still for sale
  function getMerchsForSale() public view returns (uint[]) {
    // prepare output array
    uint[] memory MerchIds = new uint[](MerchCounter);

    uint numberOfMerchsForSale = 0;
    // iterate over Merchs
    for(uint i = 1; i <= MerchCounter;  i++) {
      // keep the ID if the Merch is still for sale
      if(Merchs[i].buyer == 0x0) {
        MerchIds[numberOfMerchsForSale] = Merchs[i].id;
        numberOfMerchsForSale++;
      }
    }

    // copy the MerchIds array into a smaller forSale array
    uint[] memory forSale = new uint[](numberOfMerchsForSale);
    for(uint j = 0; j < numberOfMerchsForSale; j++) {
      forSale[j] = MerchIds[j];
    }
    return forSale;
  }

  // buy an Merch
  function buyMerch(uint _id) payable public {
    // we check whether there is an Merch for sale
    require(MerchCounter > 0);

    // we check that the Merch exists
    require(_id > 0 && _id <= MerchCounter);

    // we retrieve the Merch
    Merch storage merch = Merchs[_id];

    // we check that the Merch has not been sold yet
    require(merch.buyer == 0X0);

    // we don't allow the seller to buy his own Merch
    require(msg.sender != merch.seller);

    // we check that the value sent corresponds to the price of the Merch
    require(msg.value == merch.price);

    // keep buyer's information
    merch.buyer = msg.sender;

    // the buyer can pay the seller
    merch.seller.transfer(msg.value);

    // trigger the event
    emit LogBuyMerch(_id, merch.seller, merch.buyer, merch.name, merch.price);
  }
}
