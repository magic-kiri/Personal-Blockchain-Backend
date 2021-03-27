

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
    // let decryptedPrivateKey = cryptoSecurity.symmetricDecryption(encryptedPrivateKey,password)   
    
    // let text = "ami valo pola"
    // let cyph = cryptoSecurity.encryption(text,publicKey)
    // let ret = cryptoSecurity.decryption(cyph,decryptedPrivateKey,password)
    // console.log(Buffer.from(ret).toString('utf-8'))

    let account = new Account(username,password,publicKey,encryptedPrivateKey)

    // console.log(account)

}

signUp("text,pass","nee ase")


