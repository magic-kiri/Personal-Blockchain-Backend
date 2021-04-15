

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
    return await getDataFromId(Block, "index", index)
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
        index: 1,
        timestamp : new Date('2021-04-14T08:22:45.167+00:00'),
        previousHash : '00000',
        transactions : [],
        limit: 0
    }
    let res = await addBlock(genesisBlock)
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
        let currenBlock = targetChain[i]
        let previousHash = sha256(JSON.stringify(lastBlock))
        if(previousHash == currenBlock.previousHash)
        {
            let res = await addBlock(currenBlock)
            if(res.statusCode!=200 && cnt>0)
            {
                ////// WARNING ::: this may cause infinite loop
                console.log(previousHash)
                appendBlockchain(targetChain,cnt-1)
                break
            }
        }
        else 
            break
    }
}


async function init()
{
    let response = await getChainLength()
    let currentChainLength = response.body
    
    if(currentChainLength==0)
        currentChainLength = await createGenesisBlock()

    let adjacentChains = await getAllChain(currentChainLength-1)
    let largestChain = []
    for(let chain of adjacentChains)
    {
        // This takes the largest chain of live hosts
        if(chain.length>largestChain.length)
            largestChain = chain
    }

    // console.log("this is the largest chain ")
    // console.log(largestChain)
    await appendBlockchain(largestChain)
}


module.exports = {getChain, getBlock, init};