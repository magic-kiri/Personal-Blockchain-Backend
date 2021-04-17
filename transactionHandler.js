
const { getAllData, getDataFromKey, addData } = require(`./dbMethod`);
var Pool = require('./transactionModel')
const { tmpPrivateKey } = require('./accountHandler')
const { propagatePacket } = require('./comunicator');
const { CryptoSecurity } = require("./security")




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

        const txn = { body: transaction, signature: signature }
        const packet = { account: account, transaction: txn }
        propagatePacket(packet)
        return { statusCode: 200, body: packet }
    }
    catch (er) {
        return { statusCode: 405, body: `Error while create transaction! \n\n\n ${er}` }
    }
}

async function addInPool(txn) {
    return addData(Pool, txn)
}

async function verifyTransaction(txn, publicKey) {
    console.log(txn)
    let transaction = txn.body
    let signature = txn.signature
    const cryptoSecurity = new CryptoSecurity()
    let isVerified = cryptoSecurity.verify(Buffer.from(signature), transaction.toString(), publicKey)

    if (transaction.creatorsPublicKey != publicKey)
        isVerified = false
    console.log(isVerified)
    if (isVerified) {
        let res = await addInPool(txn)
        console.log(res)
        return res
    }
    else
        return { statusCode: 409, body: "Transaction didn't matched with signature" }
}


async function getTransactions()
{
    return getAllData(Pool)
}

module.exports = { createTransaction, verifyTransaction , getTransactions}
