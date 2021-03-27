

const {CryptoSecurity} = require("./security")
var sha256 = require('js-sha256')
const {Account} = require("./account")
const crypto = require ("crypto")


// This function returns an account. It also creates an instance in DB
function signUp(username,password)
{
    let cryptoSecurity = new CryptoSecurity()
    const {privateKey, publicKey} = cryptoSecurity.getKey(password)
    
    let encryptedPrivateKey = cryptoSecurity.symmetricEncryption(privateKey,password)
    let account = new Account(username,password,publicKey,encryptedPrivateKey)
    
    // console.log(account)

}

signUp("text,pass","nee ase")


