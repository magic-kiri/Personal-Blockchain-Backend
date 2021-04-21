

const { searchForConsensus, propagatePacket, getOwnIp } = require('./comunicator');
const { addBlock, getUpdated, validateChain, getChainLength, sortJSON } = require('./blockRoutes');
const { getTransactions, removeTransaction } = require('./transactionHandler');
const { sha256 } = require('js-sha256');


const checkIntervalTime = 10
const firstPhase = 50
const blockDuration = 35 + firstPhase

var readyToMine = false


//// chache memory
var ownPacket = null
var optimalPacket = null
var lastBlock = null
var consensusTime = new Date()
///////////////////
async function updateOptimalPacket(packet) {
    if (optimalPacket == null)
        optimalPacket = packet
    else {
        // console.log(lastBlock)
        let limit = lastBlock.limit
        const currentIp = packet.limit
        const optimalIp = optimalPacket.limit

        // const currentIp = packet.block.limit
        // const optimalIp = optimalPacket.block.limit

        console.log(limit)
        console.log('optimalIp: ' + optimalIp)
        console.log('currentIp: ' + currentIp)
        if (limit < currentIp) {
            if ((optimalIp <= limit) || (currentIp < optimalIp))
                optimalPacket = packet
        }
        else {
            if (optimalIp < currentIp)
                optimalPacket = packet
        }
    }
}


function phaseOne() {
    console.log("Phase 1")
    readyToMine = true
    return
}

async function phaseTwo() {
    // This is for block sharing
    console.log("Phase 2")
    if (ownPacket == null) {
        ownPacket = await createMyPacket()
        await updateOptimalPacket(ownPacket)
    }
    propagatePacket(optimalPacket, `propose_block`)
}

async function phaseThree() {
    console.log("Phase 3")
    const block = optimalPacket
    const transactions = block.transactions
    if (0 < transactions.length) {
        console.log("Creating new Block: ")
        console.log(block)
        await addBlock(block)
        console.log('New Block Created')
        lastBlock = block
        for (let txn of transactions)
            await removeTransaction(txn)
        
    }
    else {
        console.log(consensusTime)
        console.log("Not enough transaction!")
    }
    readyToMine = false
    ownPacket = null
    optimalPacket = null
}

async function blockManager() {
    const currentTime = new Date()
    const timeDifferece = currentTime - consensusTime
    // console.log(consensusTime)
    console.log(timeDifferece)
    if (blockDuration * 1000 < timeDifferece)
        consensusTime.setSeconds(consensusTime.getSeconds() + blockDuration)

    if (timeDifferece < firstPhase * 1000) {
        phaseOne()
        return
    }
    if (readyToMine == false) 
        return

    if ((firstPhase * 1000 < timeDifferece) && (timeDifferece < blockDuration * 1000)) {
        await phaseTwo()
    }
    else {
        await phaseThree()
    }
}



async function createMyPacket() {
    try {
        const res = await getTransactions()
        const transactions = res.body
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