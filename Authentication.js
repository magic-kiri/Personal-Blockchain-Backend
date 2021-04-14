
// const findDevice = require('local-devices');
const { CryptoSecurity } = require("./security")
const { Account } = require("./account")

const { sha256 } = require("js-sha256");


const { getDataFromId, addData } = require(`./dbMethod`);
const accountModel = require('./accountModel');


async function isAlreadyExistsInDB(username) {
    try {
        let response = await getDataFromId(accountModel, "username", username);
        if (response.length)
            return true
        return false
    } catch (err) {
        throw "No such server"
    }
}

// Creating a new Account type object
function createAccount(username, password) {
    let cryptoSecurity = new CryptoSecurity()
    const { privateKey, publicKey } = cryptoSecurity.getKey(password)
    let encryptedPrivateKey = cryptoSecurity.symmetricEncryption(privateKey, password)
    let account = new Account(username, sha256(password), publicKey, encryptedPrivateKey, new Date())
    return account
}

async function signUp(username, password) {
    // This portion checks that this username is available or not.
    try {
        if (await isAlreadyExistsInDB(username))
            return { status: "Already exist an account with this username" }
    }
    catch (err) { return { status: err } }

    //creating an Account type object
    const account = createAccount(username,password)

    // Account is going to post in Database(not through db server)
    try {
        const res = await addData(accountModel, account)
        return { status: "Account has been created", Account: account }
    }
    catch (err) {
        return { status: "Couldn't create any account!" }
    }

}

async function signIn(username, password) {
    try {
        let response = await getDataFromId(accountModel, "username", username);
        if (response.length) {
            let passHash = sha256(password)
            if (passHash == response[0].passHash)
                return { status: "Login Successful", account: response[0] }
            else
                return { status: "Wrong username or password" }
        }
        return { status: "No such account" }
    } catch (err) {
        return { status: "No such server" }
    }
}

module.exports = { signUp, signIn };