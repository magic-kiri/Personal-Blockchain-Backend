
async function getAllData(collection) {
    try {
        return await collection.find({})
    }
    catch (err) { return "Error from getting data" }
}

async function getDataFromId(collection, keyName, keyValue) {
    try {
        let query = { [keyName]: keyValue }
        console.log(query)
        return await collection.find(query)
    }
    catch (err) { return `Error from getting Data from ${keyName}!!!` }
}

async function addData(collection, data,res=null) {
    try{
    collection.create(data,function (err, data){
        if(err)
            console.log(err);
        else if(res)
            res.send(data);
    })}
    catch(err)
    {
        if(res)
            res.send("error")
    }
}

module.exports = { getAllData, getDataFromId, addData }
