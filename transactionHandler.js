
const { getAllData, getDataFromId, addData } = require(`./dbMethod`);
var Pool = require('./transactionModel')
const {tmpPrivateKey} = require('./Authentication')

const { CryptoSecurity } = require("./security")

async function createTransaction(transaction,account,password){
    try{
        const cryptoSecurity = new CryptoSecurity()
    // console.log("passphrase is : " + password)
    const privateKey = account.getPrivateKey(password)
    if(!privateKey)
        return {status:"Error with password!!!!!"}
    // console.log(privateKey)
    let signature = cryptoSecurity.signing(transaction.toString(),privateKey,password)
    // console.log(signature)
    let packet = {transaction,signature}
    let response = await addData(Pool,packet)
    return {status: "Transaction added", body: response}
    }
    catch(er)
    {
        return {status:"Error while create transaction!"}
    }   
}


module.exports = {createTransaction}
