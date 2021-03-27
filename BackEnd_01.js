

const {CryptoSecurity} = require("./security")
var sha256 = require('js-sha256')
const {Account} = require("./account")
const crypto = require ("crypto")
const fetch = require('node-fetch');



// This function returns an account. It also creates an instance in DB
async function signUp(username,password)
{
    let cryptoSecurity = new CryptoSecurity()
    const {privateKey, publicKey} = cryptoSecurity.getKey(password)
    
    let encryptedPrivateKey = cryptoSecurity.symmetricEncryption(privateKey,password)
    // Creating a new Account
    let account = new Account(username,password,publicKey,encryptedPrivateKey)

    // This portion use POST method to store an account to the database. 
    // Unhandled promise rejection... Warning
    const res = await fetch('http://localhost:8080/account', {
        method: 'POST',
        body: JSON.stringify(account),
        headers: { 'Content-Type': 'application/json' }
    })
    
    return account
   
}





