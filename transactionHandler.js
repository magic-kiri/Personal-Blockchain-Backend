
const { getAllData, getDataFromId, addData } = require(`./dbMethod`);
var Pool = require('./transactionModel')
const {tmpPrivateKey} = require('./Authentication')

const { CryptoSecurity } = require("./security")

async function createTransaction(transaction,account,password){
    let cryptoSecurity = new CryptoSecurity()
    const privateKey = account.getPrivateKey(password)
    if(!privateKey)
        return {status:"Error with password!!!!!"}
    console.log(privateKey)
    let signature = cryptoSecurity.signing(transaction,privateKey)
    console.log(signature)
    let packet = {transaction,signature}
    let response = await addData(Pool,packet)
    return {status: response}
}


module.exports = {createTransaction}
