
const { getAllData, getDataFromId, addData } = require(`./dbMethod`);
var Pool = require('./transactionModel')
const { tmpPrivateKey } = require('./Authentication')
const { propagatePacket } = require('./comunicator');
const { CryptoSecurity } = require("./security")




async function createTransaction(transaction, account, password) {
    // transaction means transaction
    try {
        const cryptoSecurity = new CryptoSecurity()
        const privateKey = account.getPrivateKey(password)
        const publicKey = account.getPublicKey()
        transaction.creatorsPublicKey = publicKey;  // Adding the public key in transaction 
        if (!privateKey)
            return { statusCode: 409, body: "Unable to decrypt with the password!" }
        const signature = cryptoSecurity.signing(transaction.toString(), privateKey, password)
        const txn = { body: transaction, signature: signature }
        const packet = { account: account, transaction: txn }
        propagatePacket(packet)
        return { statusCode:200, body: "Transaction is going to be added" }
    }
    catch (er) {
        return { statusCode: 405, body: `Error while create transaction! \n\n\n ${er}` }
    }
}


module.exports = { createTransaction }
