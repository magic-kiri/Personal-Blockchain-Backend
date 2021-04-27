const { sha256 } = require('js-sha256');
const Block = require('./BlockModel');
const { getAllData, getDataFromKey, addData, count } = require(`./dbMethod`);
const { getAllChain } = require('./communicator')
const { getTransactions, removeTransaction } = require('./transactionHandler');


async function validateChain() {
    const res = await getChain()
    if (res.statusCode != 200)
        return false
    const chain = res.body
    for (i = 1; i < chain.length; i++) {
        chain[i-1] = sortJSON(chain[i-1])
        if (sha256(JSON.stringify(chain[i-1])) != chain[i].previousHash)
            return false
    }
    return true
}

async function createGenesisBlock() {
    let genesisBlock = {
        _id: 1,
        timestamp: new Date('2021-04-14T08:22:45.167+00:00'),
        previousHash: 'GENESIS BLOCK',
        transactions: [],
        limit: 0
    }
    let res = await addBlock(sortJSON(genesisBlock))
    return res.body
}

async function getUpdated() {
    let response = await getChainLength()
    let currentChainLength = response.body

    if (currentChainLength == 0) {
        await createGenesisBlock()
        currentChainLength = 1
    }
    let adjacentChains = await getAllChain(currentChainLength - 1)
    let largestChain = []
    for (let chain of adjacentChains) {
        // This takes the largest chain of live hosts
        if (chain.length > largestChain.length)
            largestChain = chain
    }
    let res = await appendBlockchain(largestChain)
    return res
}



//////// This function extends our existing chain ... cnt is used for if storing in DB is failed...
async function appendBlockchain(targetChain, cnt = 3) {
    let response = await getChain()
    let currentChain = response.body
    let lastBlock = currentChain[currentChain.length - 1]
    // let previousHash = sha256(JSON.stringify(lastBlock))
    // console.log("trying to append!")
    for (i = currentChain.length; i < targetChain.length; i++) {
        let currentBlock = targetChain[i]
        lastBlock = sortJSON(lastBlock)
        let previousHash = sha256(JSON.stringify(lastBlock))

        if (previousHash == currentBlock.previousHash) {
            let res = await addBlock(currentBlock)
            let transactions  = currentBlock.transactions
            for(let txn of transactions)
                removeTransaction(txn)
            if (res.statusCode != 200 && cnt > 0) {
                ////// WARNING ::: this may cause infinite loop
                console.log("ERROR WITH DATABASE WHILE APPENDING BLOCK:")
                console.log(currentBlock)
                return res
                // appendBlockchain(targetChain,cnt-1)
                break
            }
        }
        else {
            console.log('Error while appending chain!!!')
            return { statusCode: 409, body: lastBlock }
        }
        lastBlock = currentBlock
    }
    return { statusCode: 200, body: lastBlock, hashValue: sha256(JSON.stringify(lastBlock)) }
}



async function getChain() {
    return await getAllData(Block)
}

async function getBlock(index) {
    return await getDataFromKey(Block, "_id", index)
}

async function getChainLength() {
    return await count(Block)
}

async function addBlock(block) {
    return await addData(Block, block)
}

function sortJSON(unordered) {
    const ordered = Object.keys(unordered).sort().reduce(
        (obj, key) => {
            obj[key] = unordered[key];
            return obj;
        },
        {}
    );
    return unordered
}

module.exports = { addBlock, getChainLength, getBlock, getChain, getUpdated, validateChain, sortJSON }