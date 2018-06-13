const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');
const {interface, bytecode} = require('./compile');

const provider = new HDWalletProvider(
    'enemy whip share life bronze damp wall topic pig bean around blue',
    'https://rinkeby.infura.io/XfAYFkw29fHW7nJ51Mg4'
);

const web3 = new Web3(provider);

const deploy = async() => {
    const accounts = await web3.eth.getAccounts(); 
    console.console.log('Attempting to deploy from account', accounts[0]);

    const result = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({data: bytecode, arguments: ['Hi there!']})
        .send({gas: '1000000', from: accounts[0]});
        
    console.log('Contract deployed to', result.options.address);
};

deploy();