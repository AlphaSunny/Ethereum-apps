mkdir -p ~/ChainSkills/Training/Greetings/
cd ~/ChainSkills/Training/Greetings/
npm init   (all default)

npm install web3@0.20.0 solc@0.4.18

#create Greetings.sol



���������ܺ�Լ��ganache
#start node

Web3 = require('web3')
web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:7545"))
web3.eth.accounts
solc = require('solc')
sourceCode = fs.readFileSync('Greetings.sol').toString()
compileCode = solc.compile(sourceCode)

#get the abi
contactABI = JSON.parse(compileCode.contracts[':Greetings'].interface)
greetingsContract = web3.eth.contract(contractABI)

byteCode = compileCode.contracts[':Greetings'].bytecode

greetingsDeployed = greetingsContract.new({data:byteCode, from:web3.eth.account[0], gas:4700000})

����д���greetingsDeployed = greetingsContract.new({data:'0x'+byteCode, from:web3.eth.account[0], gas:4700000})

greetingsInstance = greetingsContract.at(greetingsDeployed.address)

greetingsInstance.getGreetings()

greetingsInstance.setGreetings("Hello ChainSkills!", {from: web3.eth.accounts[0]})

greetingsInstance.getGreetings()