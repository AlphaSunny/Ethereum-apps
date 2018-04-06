const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());
const { interface, bytecode}= require('../compile');

let inbox;
let accounts;

beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    console.log(accounts);
    inbox = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({
            data: bytecode,
            arguments: ['Hello world!']
        })
        .send({from: accounts[0], gas: '1000000'});
});

describe('Inbox', ()=> {
    it('deploys a contract', () => {
        assert.ok(inbox.options.address);
    });
    it('has a default message', async() => {
        const message = await inbox.methods.message().call();
        assert.equal(message, 'Hello world!');
    });
    it('can change the message', async() => {
        await inbox.methods.setMessage('Hello yang').send({from:accounts[0]});
        console.log(accounts[0]);
        const message = await inbox.methods.message().call();
        assert.equal(message, 'Hello yang');
    })
});

/*
class Car {
    park() {
        return 'stopped';
    }
    
    drive() {
        return 'drive';
    }   
}

describe('Car', ()=> {
    it('can park', ()=> {
        const car = new Car();
        assert.equal(car.park(), 'stopped');
    });
    
    it('can drive', () => {
        const car = new Car();
        assert.equal(car.drive(), 'drive');
    });
})
*/