

const { sha256 } = require('js-sha256');
const Block = require('./BlockModel');
const { getAllChain, searchForConsensus } = require('./comunicator');
const { getAllData, getDataFromKey, addData, count } = require(`./dbMethod`);

var consensusTime = new Date()

function getConsensusTime() {
    return consensusTime
}

function setConsensusTime(csTime) {
    return consensusTime = csTime
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

async function validateChain() {
    const res = await getChain()
    if(res.statusCode!=200)
        return false
    const chain = res.body
    // console.log(chain)
    for (i = 1; i < chain.length; i++) {
        // console.log(sha256(JSON.stringify(chain[i - 1])))
        // console.log(chain[i].previousHash)
        if (sha256(JSON.stringify(chain[i - 1])) != chain[i].previousHash)
            return false
    }
    return true
}

async function createGenesisBlock() {
    let genesisBlock = {
        _id: 1,
        timestamp: new Date('2021-04-14T08:22:45.167+00:00'),
        previousHash: '00000',
        publicKey: 'genesis block',
        transactions: [],
        limit: 0
    }
    // console.log("Creating genesis block")
    let res = await addBlock(genesisBlock)
    // console.log(res)
    return res.body
}


//////// This function extends our existing chain ... cnt is used for if storing in DB is failed...
async function appendBlockchain(targetChain, cnt = 3) {
    let response = await getChain()
    let currentChain = response.body
    let lastBlock = currentChain[currentChain.length - 1]
    let previousHash = sha256(JSON.stringify(lastBlock))
    // console.log("HASH:")
    // console.log(previousHash)
    for (i = currentChain.length; i < targetChain.length; i++) {
        let currentBlock = targetChain[i]
        let previousHash = sha256(JSON.stringify(lastBlock))
        if (previousHash == currentBlock.previousHash) {
            // console.log("genjam")
            let res = await addBlock(currentBlock)
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
            return { statusCode: 409, body: "Block didnt matched: " + JSON.stringify(currentBlock) }
        }
        lastBlock = currentBlock
    }
    return { statusCode: 200, body: { lastBlock, hashValue: sha256(JSON.stringify(lastBlock)) } }
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
    // console.log("largest Chain:")
    // console.log(largestChain)
    let res = await appendBlockchain(largestChain)
    return res
}

var proposedPackets = []


async function proposeBlock(packet) {
    const { ip, block, signature } = packet
    const publicKey = block.publicKey

    if (verifyBlock(block, signature, publicKey) && limit == ip) {
        proposedPackets.push(packet)
        return { statusCode: 200, body: 'Proposal accepted :D' }
    }
    else
        return { statusCode: 406, body: 'Invalid block proposed' }
}


function verifyBlock(block, sign, publicKey) {
    const signature = JSON.parse(sign)
    const cryptoSecurity = new CryptoSecurity()
    return cryptoSecurity.verify(Buffer.from(signature), block.toString(), publicKey)
}

async function init() {

    let othersConsensusTime = await searchForConsensus()
    let lastBlock = await getUpdated()
    console.log('Chain Validity: ' + await validateChain())

    if (othersConsensusTime)
        setConsensusTime(othersConsensusTime)
    console.log('Consensus Time: ' + getConsensusTime())
}


module.exports = { getChain, getBlock, init, addBlock, getUpdated, proposeBlock, getConsensusTime };