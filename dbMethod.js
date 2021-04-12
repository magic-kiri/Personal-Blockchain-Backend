
async function getAllData(collection) {
    try {
        return await collection.find({})
    }
    catch (err) { return "Error from getting data" }
}

async function getDataFromId(collection, keyName, keyValue) {
    try {
        let query = { [keyName]: keyValue }
        return await collection.find(query)
    }
    catch (err) { return `Error from getting Data from ${keyName}!!!` }
}

async function addData(collection, data) {
    return await collection.create(data);
}

module.exports = { getAllData, getDataFromId, addData }
