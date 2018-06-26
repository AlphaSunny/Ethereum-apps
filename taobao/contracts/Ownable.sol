pragma solidity ^0.4.18;

contract Ownable {
  // 创始人
  address owner;

  // 设置创始人权限
  modifier onlyOwner() {
    require(msg.sender == owner);
    _;
  }

  // 创始人构造器
  function Ownable() public {
    owner = msg.sender;
  }
}
