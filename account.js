const crypto = require("crypto")
const { sha256 } = require("js-sha256")

class Account{

    constructor(username,password,publicKey,encryptedPrivateKey)
    {
        this.publicKey = publicKey
        this.encryptedPrivateKey = encryptedPrivateKey
        this.username = username
        this.passHash = sha256(password)
    }
    getPublicKey(){
        return this.publicKey
    }
    getEncryptedPrivateKey(){
        return this.encryptedPrivateKey
    }
    
}

module.exports = {Account}