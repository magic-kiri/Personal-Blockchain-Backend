
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
    try {
        return await collection.create(data);
    }
    catch (err) {
        return err;
    }

}

module.exports = { getAllData, getDataFromId, addData }
