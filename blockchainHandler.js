

const { sha256 } = require('js-sha256');
const Block = require('./BlockModel');
const { getAllChain } = require('./comunicator');
const { getAllData, getDataFromId, addData, count } = require(`./dbMethod`);

async function getChain()
{
    return await getAllData(Block)
}

async function getBlock(index)
{
    return await getDataFromId(Block, "_id", index)
}

async function getChainLength()
{
    return await count(Block)
}

async function addBlock(block)
{
    return await addData(Block,block)
}

async function createGenesisBlock()
{
    let genesisBlock = {
        _id : 1,
        timestamp : new Date('2021-04-14T08:22:45.167+00:00'),
        previousHash : '00000',
        transactions : [],
        limit: 0
    }
    // console.log("Creating genesis block")
    let res = await addBlock(genesisBlock)
    // console.log(res)
    return res.body
}


//////// This function extends our existing chain ... cnt is used for if storing in DB is failed...
async function appendBlockchain(targetChain,cnt = 3)
{
    let response = await getChain()
    let currentChain = response.body
    let lastBlock = currentChain[currentChain.length-1]

    for(i=currentChain.length;i<targetChain.length;i++)
    {
        let currentBlock = targetChain[i]
        let previousHash = sha256(JSON.stringify(lastBlock))
        
        if(previousHash==currentBlock.previousHash)
        {
            let res = await addBlock(currentBlock)
            if(res.statusCode!=200 && cnt>0)
            {
                ////// WARNING ::: this may cause infinite loop
                console.log("ERROR WITH DATABASE WHILE APPENDING BLOCK:")
                console.log(currentBlock)
                return res
                // appendBlockchain(targetChain,cnt-1)
                break
            }
        }
        else
        {
            return {statusCode: 409, body: "Block didnt matched: " + JSON.stringify(currentBlock) }
        }
        lastBlock = currentBlock   
    }
    return {statusCode: 200, body: {lastBlock: lastBlock, hashValue: sha256(JSON.stringify(lastBlock))}}
}

async function getUpdated()
{
    let response = await getChainLength()
    let currentChainLength = response.body

    if(currentChainLength==0)
    {
        await createGenesisBlock()
        currentChainLength = 1
    }
    let adjacentChains = await getAllChain(currentChainLength)
    let largestChain = []
    for(let chain of adjacentChains)
    {
        // This takes the largest chain of live hosts
        if(chain.length>largestChain.length)
            largestChain = chain
    }
    // console.log("largest Chain:")
    // console.log(largestChain)
    let res = await appendBlockchain(largestChain)
    return res
}


async function init()
{
    await getUpdated()
}


module.exports = {getChain, getBlock, init,addBlock,getUpdated};