
// const findDevice = require('local-devices');
const { CryptoSecurity } = require("./security")
const { Account } = require("./account")
const fetch = require('node-fetch');
const { sha256 } = require("js-sha256");
const dbPort = 8080

const { getAllData, getDataFromId, addData } = require(`./dbMethod`);
const accountModel = require('./accountModel');



async function signUp(username, password) {
    // This portion checks that this username is available or not.
    try {
        let response = await getDataFromId(accountModel,"username",username);
        if (response.length)
            return "Already exist an account with this username"
    } catch (err) {
        return "No such server"
    }

    let cryptoSecurity = new CryptoSecurity()
    const { privateKey, publicKey } = cryptoSecurity.getKey(password)

    let encryptedPrivateKey = cryptoSecurity.symmetricEncryption(privateKey, password)
    // Creating a new Account
    let account = new Account(username, password, publicKey, encryptedPrivateKey)
    
    // Account is going to post in Database(not through db server)
    try {
        const res = await addData(accountModel,account)
        return "Account has been created"
    }
    catch (err) {
        return "Couldn't create any account!"
    }

}

async function signIn(username, password) {
    try {
        let response = await getDataFromId(accountModel,"username",username);
        if (response.length)
        {
            let passHash = sha256(password)
            if(passHash == response[0].passHash)
                return "Login Successful"
            else
                return "Wrong username or password"
        }
    } catch (err) {
        return "No such server"
    }
}

module.exports = { signUp, signIn };