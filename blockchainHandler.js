

const Block = require('./BlockModel')
const { getAllData, getDataFromId, addData } = require(`./dbMethod`);



async function getBlockchain()
{
    return await getAllData(Block)
}

async function getBlock(index)
{
    return await getDataFromId(Block, "index", index)
}


async function init()
{
    
}


module.exports = {getBlockchain, getBlock, init};