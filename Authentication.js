
// const findDevice = require('local-devices');
const { CryptoSecurity } = require("./security")
const { Account } = require("./account")
const fetch = require('node-fetch');
const { sha256 } = require("js-sha256");
const dbPort = 8080

// This function returns an account. It also creates an instance in DB
async function signUp(username, password) {

    try {
        const response = await fetch(`http://localhost:${dbPort}/account/${username}`)
        const ret = await response.text()
        let arr = JSON.parse(ret)
        if (arr.length)
            return "Already exist an account with this username"
    } catch (err) {
        // console.log("jhamela")
        return "No such server"
    }

    let cryptoSecurity = new CryptoSecurity()
    const { privateKey, publicKey } = cryptoSecurity.getKey(password)

    let encryptedPrivateKey = cryptoSecurity.symmetricEncryption(privateKey, password)
    // Creating a new Account
    let account = new Account(username, password, publicKey, encryptedPrivateKey)
    console.log("account has permission to signup")
    // This portion use POST method to store an account to the database. 
    // Unhandled promise rejection... Warning
    try {
        const res = await fetch(`http://localhost:${dbPort}/account`, {
            method: 'POST',
            body: JSON.stringify(account),
            headers: { 'Content-Type': 'application/json' }
        })

        return "Account has been created"
    }
    catch (err) {
        return { status: "Couldn't create any account!", error: err }
    }

}

async function signIn(username, password) {

    try {
        const response = await fetch(`http://localhost:${dbPort}/account/${username}`)
        const ret = await response.text()
        let arr = JSON.parse(ret)
        if (arr.length)
        {
            let passHash = arr[0].passHash
            if(passHash == sha256(password))
                return "Login Successful"
            else
                return "Wrong username or password"
        }
        else
            return "No such account"
    } catch (err) {
        return "No such server"
    }
}


// cmp()


module.exports = { signUp, signIn };