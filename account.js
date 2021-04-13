const { sha256 } = require("js-sha256")
const {CryptoSecurity} = require("./security")

class Account{


    constructor(username,passHash,publicKey,encryptedPrivateKey,timestamp)
    {
        this.publicKey = publicKey
        this.encryptedPrivateKey = encryptedPrivateKey
        this.username = username
        this.passHash = passHash
        this.timestamp =timestamp
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
            return cryptoSecurity.symmetricDecryption(this.encryptedPrivateKey,password).toString();
        }
        else 
            return false;
    }
    
}

module.exports = {Account}