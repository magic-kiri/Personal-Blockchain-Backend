
async function getAllData(collection) {
    try {
        const response = await collection.find({})
        return { statusCode: 200, body: response }
    }
    catch (err) { return { statusCode: 400, body: `Error from getting Data of ${collection}` } }
}

async function getDataFromKey(collection, keyName, keyValue) {
    try {
        let query = { [keyName]: keyValue }
        let response = await collection.find(query)
        return { statusCode: 200, body: response }
    }
    catch (err) {
        return { statusCode: 400, body: `Error from getting Data with ${keyName}!!!\n + ${err}` }
    }
}

async function addData(collection, data) {
    try {
        let response = await collection.create(data);
        return { statusCode: 200, body: response }
    }
    catch (err) {
        return { statusCode: 400, body: `Error from adding Data with ${data}!!!\n + ${err}` }
    }

}

async function count(collection) {
    try {
        let response = await collection.countDocuments({})
        return { statusCode: 200, body: response }
    } catch (err) {
        return { statusCode: 400, body: `Error occured while getting count from ${collection}!!!\n + ${err}` }
    }
}

async function removeById(collection,id){
    try{
        let response = await collection.findByIdAndDelete(id) 
        return { statusCode: 200 ,body: response}
    }catch(err)
    {
        console.log(err)
    }
}

module.exports = { getAllData, getDataFromKey, addData ,count,removeById }
