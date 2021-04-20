

const { searchForConsensus, propagatePacket, getOwnIp } = require('./comunicator');
const { addBlock, getUpdated, validateChain, getChainLength } = require('./blockRoutes');
const { getTransactions, removeTransaction } = require('./transactionHandler');
const { sha256 } = require('js-sha256');


const checkIntervalTime = 15
const firstPhase = 25
const blockDuration = 30 + firstPhase

//// chache memory
var optimalPacket = null
var lastBlock = null
var consensusTime = new Date()
///////////////////
async function updateOptimalPacket(packet) {
    if (optimalPacket == null)
        optimalPacket = packet
    else {
        // console.log(packet)
        let limit = lastBlock.limit
        const currentIp = packet.limit
        const optimalIp = optimalPacket.limit

        // const currentIp = packet.block.limit
        // const optimalIp = optimalPacket.block.limit
        if (limit < currentIp) {
            if ((optimalIp <= limit) || (currentIp < optimalIp))
                optimalIp = packet
        }
        else {
            if (optimalIp < currentIp)
                optimalIp = packet
        }
    }
}


async function blockManager() {
    const currentTime = new Date()
    const timeDifferece = currentTime - consensusTime
    if (timeDifferece < firstPhase * 1000) {
        optimalPacket = null
    }
    else if ((firstPhase * 1000 < timeDifferece) && (timeDifferece < blockDuration * 1000)) {
        // This is for block sharing 
        const myPacket = await createMyPacket()
        await updateOptimalPacket(myPacket)
        propagatePacket(optimalPacket, `propose_block`)
    }
    else {
        const block = optimalPacket
        const transactions = block.transactions
        if (0< transactions.length) {
            console.log("Creating new Block: ")
            console.log(block)
            const res = await addBlock(block)
            console.log('New Block Created')

            for (let txn of transactions)
                await removeTransaction(txn)
            lastBlock = block
           
        }
        else
        {
            console.log(consensusTime)
            console.log("Not enough transaction!")
        }
        consensusTime.setSeconds(consensusTime.getSeconds() + blockDuration)
    }
}



async function createMyPacket() {
    try {
        const res = await getTransactions()

        const transactions = res.body
        const block = {
            _id: (1 + lastBlock._id),
            timestamp: new Date(),
            previousHash: sha256(JSON.stringify(lastBlock)),
            transactions: transactions,
            limit: getOwnIp()
        }

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
    // const { block, signature } = packet
    // const { publicKey } = block
    // if (verifyBlock(block, signature, publicKey)) {
    //     updateOptimalPacket(packet)
    //     // proposedPackets.push(packet)
    //     return { statusCode: 200, body: 'Proposal accepted :D' }
    // }
    // else
    //     return { statusCode: 406, body: 'Invalid block proposed' }
}


// function verifyBlock(block, sign, publicKey) {
//     const signature = JSON.parse(sign)
//     const cryptoSecurity = new CryptoSecurity()
//     return cryptoSecurity.verify(Buffer.from(signature), block.toString(), publicKey)
// }


async function init() {
    let othersConsensusTime = await searchForConsensus()    // searching for consesus time 
    if (othersConsensusTime)
        setConsensusTime(othersConsensusTime)
    console.log('Consensus Time: ' + getConsensusTime())



    lastBlock = (await getUpdated()).body                  // loading last block
    if (lastBlock == null)
        console.log('Unable to get last block!!!!!!!!!!\nPLEASE RESTART SERVER')
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