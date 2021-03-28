const { sha256 } = require("js-sha256")
const {CryptoSecurity} = require("./security")

class Account{

    constructor(username,password,publicKey,encryptedPrivateKey)
    {
        this.publicKey = publicKey
        this.encryptedPrivateKey = encryptedPrivateKey
        this.username = username
        this.passHash = sha256(password)
        this.timestamp = new Date()
    }
    getPublicKey(){
        return this.publicKey
    }
    getEncryptedPrivateKey(){
        return this.encryptedPrivateKey
    }

    getPrivateKey(password)
    {
        if(this.passHash == sha256(password))
        {
            let cryptoSecurity = new CryptoSecurity()
            return cryptoSecurity.symmetricDecryption(this.encryptedPrivateKey,password);
        }
        else 
            return false;
    }
    
}

module.exports = {Account}