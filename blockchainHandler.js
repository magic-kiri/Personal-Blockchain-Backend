

const { sha256 } = require('js-sha256');
const Block = require('./BlockModel');
const { getAllChain, searchForConsensus, propagatePacket } = require('./comunicator');
const { getAllData, getDataFromKey, addData, count } = require(`./dbMethod`);

var consensusTime = new Date()
const checkIntervalTime = 15

const firstPhase = 85
const blockDuration = 30 + firstPhase

var limit = null
var optimalPacket

async function updateOptimalPacket(packet) {
    if(optimalPacket==null)
        optimalPacket = packet
    else
    {
        if(limit==null)
            limit = await getLimit()
    }
}


async function blockManager()
{   
    const currentTime = new Date()
    const timeDifferece =  currentTime-consensusTime
    if(timeDifferece < firstPhase*1000)
    {
        optimalPacket = null
        limit = null
    }
    else if( (firstPhase*1000 < timeDifferece) && (timeDifferece < blockDuration*1000) )
    {
        // This is for block sharing 
        const myPacket = await createMyPacket()
        updateOptimalPacket(myPacket)
        propagatePacket(packet,`propose_block`)
    }
    else{

    }
    
}

async function createMyPacket()
{
    return {}
}



//////// This function extends our existing chain ... cnt is used for if storing in DB is failed...
async function appendBlockchain(targetChain, cnt = 3) {
    let response = await getChain()
    let currentChain = response.body
    let lastBlock = currentChain[currentChain.length - 1]
    // let previousHash = sha256(JSON.stringify(lastBlock))

    for (i = currentChain.length; i < targetChain.length; i++) {
        let currentBlock = targetChain[i]
        let previousHash = sha256(JSON.stringify(lastBlock))
        if (previousHash == currentBlock.previousHash) {
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
    let res = await appendBlockchain(largestChain)
    return res
}

async function proposePacket(packet) {
    const { block, signature } = packet
    const {publicKey} = block
    if (verifyBlock(block, signature, publicKey)) {
        updateOptimalPacket(packet)
        // proposedPackets.push(packet)
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

    // setInterval(()=> blockManager(), checkIntervalTime*1000)
    console.log(await getLimit())
}



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

async function getLimit()
{
    try{
        const res = await getChainLength()
        const block =  ((await getBlock(res.body)).body)[0]
        const limit = block.limit
        return limit
    }catch(err){console.log("error getting limit! \n" + err)}
    return -1
}

async function validateChain() {
    const res = await getChain()
    if(res.statusCode!=200)
        return false
    const chain = res.body
    for (i = 1; i < chain.length; i++) {
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
    let res = await addBlock(genesisBlock)
    return res.body
}


module.exports = { getChain, getBlock, init, addBlock, proposePacket, getConsensusTime };