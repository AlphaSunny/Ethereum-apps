const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');
const { interface, bytecode } = require('./compile');

const provider = new HDWalletProvider(
  'enemy whip share life bronze damp wall topic pig bean around blue',
  'https://rinkeby.infura.io/XfAYFkw29fHW7nJ51Mg4' 
);
const web3 = new Web3(provider);

const deploy = async () => {
  const accounts = await web3.eth.getAccounts();

  console.log('Attempting to deploy from account', accounts[0]);

  const result = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({ data: bytecode, arguments: ['Hi there!'] })
    .send({ gas: '1000000', from: accounts[0] });

  console.log('Contract deployed to', result.options.address);
};
deploy();

/*
Attempting to deploy from account 0x5d0a74f621ed2153cFE96aC2CB36E1aeD9361868
Contract deployed to 0xfEF4d5b1fFCEB525c923227128EbCC73299B2A6f
*/