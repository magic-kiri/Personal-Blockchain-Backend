

const { getAllData, getDataFromKey, addData } = require(`./dbMethod`);
var Pool = require('./transactionModel')
const { propagatePacket } = require('./comunicator');
const { CryptoSecurity } = require("./security");
const { sha256 } = require('js-sha256');

async function createTransaction(transaction, account, password) {
    // transaction means transaction
    try {
        const cryptoSecurity = new CryptoSecurity()
        const privateKey = account.getPrivateKey(password)
        const publicKey = account.getPublicKey()

        transaction.creatorsPublicKey = publicKey;  // Adding the public key in transaction 
        transaction.timestamp = new Date()          // Adding timestamp...
        
        if (!privateKey)
            return { statusCode: 409, body: "Unable to decrypt with the password!" }
        const signature = cryptoSecurity.signing(transaction.toString(), privateKey, password)
        
        const packet = { transaction: transaction, signature: signature }
        
        propagatePacket(packet)
        return await verifyTransaction(packet)
    }
    catch (er) {
        return { statusCode: 405, body: `Error while create transaction! \n\n\n ${er}` }
    }
}


async function isAlreadyExistsInDB(_id) {
    let response = await getDataFromKey(Pool, "_id", _id);
    if (response.statusCode == 200) {
        let accounts = response.body
        if (accounts.length)
            return { statusCode: 200, body: true }
        return { statusCode: 200, body: false }
    }
    else
        return response
}

async function addInPool(txn) {
    let res = await isAlreadyExistsInDB(sha256(JSON.stringify(txn)))
    if(res.statusCode == 200)
    {
        if(res.body)
            return {statusCode: 200, body: "This transaction already exists in our Pool!"}
        else
        {
            let hash =  sha256(JSON.stringify(txn))
            txn._id = hash
            return addData(Pool, txn)
        }
    }
    else
        return res
    
}

async function verifyTransaction(packet) {
    
    let transaction = packet.transaction
    let signature = packet.signature
    let publicKey = transaction.creatorsPublicKey
    
    const cryptoSecurity = new CryptoSecurity()
    let isVerified = cryptoSecurity.verify(Buffer.from(signature), transaction.toString(), publicKey)

    if (isVerified) {
        let res = await addInPool(packet)
        return res
    }
    else
        return { statusCode: 409, body: "Transaction didn't matched with signature" }
}

async function getTransactions()
{
    return getAllData(Pool)
}


module.exports = { createTransaction, verifyTransaction , getTransactions }
