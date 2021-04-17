
// const findDevice = require('local-devices');
const { CryptoSecurity } = require("./security")
const { Account } = require("./account")
const { comunicatorInit } = require('./comunicator');
const { sha256 } = require("js-sha256");

const {getAllData, getDataFromId, addData } = require(`./dbMethod`);
const accountModel = require('./accountModel');


async function isAlreadyExistsInDB(username) {
    let response = await getDataFromId(accountModel, "username", username);
    if (response.statusCode == 200) {
        let accounts = response.body
        if (accounts.length)
            return { statusCode: 200, body: true }
        return { statusCode: 200, body: false }
    }
    else
        return response
}

// Creating a new Account type object
function createAccount(username, password) {
    let cryptoSecurity = new CryptoSecurity()
    const { privateKey, publicKey } = cryptoSecurity.getKey(password)
    let encryptedPrivateKey = cryptoSecurity.symmetricEncryption(privateKey, password)
    let account = new Account(username, sha256(password), publicKey, encryptedPrivateKey, new Date())
    return account
}

async function addAccountInDB(account) {
    return await addData(accountModel, account)
}

// This function adds an account if its not already exist
async function addAccount(account) {
    try {
        let response = await isAlreadyExistsInDB(account.username)
        if (response.statusCode == 200) {
            if (response.body == false)
                return addAccountInDB(account)
            //  console.log("yes");
            return { statusCode: 200, body: `This account was previously added!` }
        }
        else
            return response
    }
    catch (err) {
        return { statusCode: 206, body: err }
    }
    // Account is going to post in Database(not through db server)

}

// This function creates an account with username and password
async function signUp(username, password) {
    // This portion checks that this username is available or not.

    let response = await isAlreadyExistsInDB(username)
    if (response.statusCode == 200) {
        if (response.body == true)
            return { statusCode: 406, body: `There is an account with this username:${username}` }
    }
    else
        return response
    //creating an Account type object
    const account = createAccount(username, password)

    // Account is going to post in Database(not through db server)
    return addAccountInDB(account)
}

async function signIn(username, password) {
    let response = await getDataFromId(accountModel, "username", username);
    if (response.statusCode == 200) {
        let accounts = response.body
        if (accounts.length) {
            let passHash = sha256(password)
            if (passHash == accounts[0].passHash)
                return { statusCode: 200, body: accounts[0] }
            else
                return { statusCode: 406, body: 'Password didn\'t matched!' }
        }
        return { statusCode: 404, body: 'No such account with this username!' }
    }
    else
        return { statusCode: response.statusCode, body: 'No such server!' }
}

async function getAccounts()
{
    return await getAllData(accountModel)
}
async function getAccount(username)
{
    return await getDataFromId(accountModel, "username", username)
}


async function init()
{
    comunicatorInit()
}

module.exports = { signUp, signIn, addAccount, getAccounts , getAccount,init }