

const { searchForConsensus, propagatePacket, getOwnIp } = require('./comunicator');
const { addBlock, getUpdated, validateChain, sortJSON } = require('./blockRoutes');
const { getTransactions, removeTransaction } = require('./transactionHandler');
const { sha256 } = require('js-sha256');


const checkIntervalTime = 10

const blockDuration = 80

var optimalBlock = new Map()

//// chache memory
var ownPacket = null
var lastBlock = null
var cntShare = 0
var consensusTime = new Date()
///////////////////
async function updateOptimalPacket(packet) {
    
    if(optimalBlock.has(packet._id))
    {
        // console.log(lastBlock)
        let limit = lastBlock.limit
        const currentIp = packet.limit
        const optimalIp = optimalBlock.get(packet._id).limit
        // const currentIp = packet.block.limit
        // const optimalIp = optimalPacket.block.limit
        console.log(limit)
        console.log('optimalIp: ' + optimalIp)
        console.log('currentIp: ' + currentIp)
        if (limit < currentIp) {
            if ((optimalIp <= limit) || (currentIp < optimalIp))
            optimalBlock.set(packet._id,packet)
        }
        else {
            if (optimalIp < currentIp || currentIp == limit)
            optimalBlock.set(packet._id,packet)
        }
        console.log("After : ")
        console.log(optimalBlock.get(packet._id).limit)
    }
    else
    {
        optimalBlock.set( packet._id , packet)
    }
}


async function sharingPhase() {
    // This is for block sharing
    cntShare++
    console.log("Phase 1")
    if (ownPacket == null) {
        ownPacket = await createMyPacket()
        console.log(`OWN PACKET:  \n"`)
        // console.log(ownPacket)
        await updateOptimalPacket(ownPacket)
    }
    propagatePacket(optimalBlock.get(lastBlock._id+1), `propose_block`)
}

async function finalPhase() {
    console.log("Phase 2")
    if (cntShare < 3) {
        lastBlock = (await getUpdated()).body
        lastBlock = sortJSON(lastBlock)
        return
    }
    const block = optimalBlock.get(lastBlock._id+1)
    const transactions = block.transactions
    optimalBlock.delete(lastBlock._id+1)

    if (0 < transactions.length) {
        console.log("Creating new Block: ")
        console.log(block)
        addBlock(block)                         // Async function
        console.log('New Block Created')
        lastBlock = block
        for (let txn of transactions)
            removeTransaction(txn)              // Async function
    }
    else {
        console.log(consensusTime)
        console.log("Not enough transaction!")
    }
}

async function blockManager() {
    const currentTime = new Date()
    const timeDifferece = currentTime - consensusTime
    console.log(`Time Difference:: `)
    console.log(timeDifferece)

    if ((timeDifferece < blockDuration * 1000)) {
        await sharingPhase()
    }
    else {
        consensusTime.setSeconds(consensusTime.getSeconds() + blockDuration)
        await finalPhase()
        cntShare = 0
        ownPacket = null
        optimalBlock.delete(lastBlock._id)
    }
}

async function createMyPacket() {
    try {
        const res = await getTransactions()
        const transactions = res.body
        console.log(JSON.stringify(transactions))
        lastBlock = sortJSON(lastBlock)
        const block = {
            transactions: transactions,
            _id: (1 + lastBlock._id),
            timestamp: new Date(),
            previousHash: sha256(JSON.stringify(lastBlock)),
            limit: getOwnIp()
        }
        createdOwnBlock = true
        return block
    }
    catch (err) {
        console.log(`Error while creating my block packet`)
        console.log(err)
    }
    return {}
}

async function proposePacket(packet) {
    updateOptimalPacket(packet)
    return { statusCode: 200, body: 'Proposal accepted :D' }
}

async function init() {
    let othersConsensusTime = await searchForConsensus()    // searching for consesus time 
    console.log(othersConsensusTime)
    if (othersConsensusTime) {
        setConsensusTime(new Date(othersConsensusTime))
    }

    console.log('Consensus Time: ' + getConsensusTime())


    lastBlock = (await getUpdated()).body                  // loading last block
    console.log(`LAST BLOCK: `)
    console.log(lastBlock)
    if (lastBlock == null)
        console.log('Unable to get last block!!!!!!!!!!\nPLEASE RESTART SERVER')
    lastBlock = sortJSON(lastBlock)
    console.log('Chain Validity: ' + await validateChain())


    setInterval(() => blockManager(), checkIntervalTime * 1000)
}



function getConsensusTime() {
    return consensusTime
}

function setConsensusTime(csTime) {
    return consensusTime = csTime
}

module.exports = { init, proposePacket, getConsensusTime };