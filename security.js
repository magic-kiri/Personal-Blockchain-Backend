const crypto = require("crypto")
var sha256 = require('js-sha256')



class CryptoSecurity{
    constructor(){}
    getKey(pass){

        const {publicKey, privateKey} = crypto.generateKeyPairSync('rsa', {
                    modulusLength: 2048,    // options
                    publicExponent: 0x10101,
                    publicKeyEncoding: {type: 'spki',format: 'pem',passphrase:pass},
                    privateKeyEncoding: {type: 'pkcs8',format: 'pem', cipher: 'aes-192-cbc',passphrase: pass   }
              });
        return {privateKey, publicKey};
    }
    encryption(plaintext,publicKey){
        const encryptedData = crypto.publicEncrypt(publicKey  , Buffer.from(plaintext))
        // console.log("encypted data: ", encryptedData.toString("base64"))
        return encryptedData.toString("base64")
    }
    decryption(cipher,privateKey,pass){
        const decryptedData = crypto.privateDecrypt(
            {
              key: privateKey,  passphrase: pass},
            Buffer.from(cipher, "base64")
          );
        // The decrypted data is of the Buffer type, which we can convert to a
        // string to reveal the original data
        // console.log("decrypted data: ", decryptedData.toString())
        return decryptedData.toString();
    }
    signing(verifiableData,privateKey,pass)
    {
        // The signature method takes the data we want to sign, the
        // hashing algorithm, and the padding scheme, and generates
        // a signature in the form of bytes
        const signature = crypto.sign("sha256", Buffer.from(verifiableData), {
            key: privateKey,
            padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
            passphrase: pass
            
        })
        // console.log(signature.toString("base64"))
        return signature
    }

    verify(signature,verifiableData,publicKey)
    {
        const isVerified = crypto.verify("sha256", Buffer.from(verifiableData),
            {
                key: publicKey,
                padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
                // passphrase:pass
            },
            signature
        )
        // console.log("signature verified: ", isVerified)
        return isVerified
    }
    
    symmetricEncryption(text,password) {
        let key = crypto.scryptSync(password, 'salt', 24)
        const iv = crypto.randomBytes(16)
        let cipher = crypto.createCipheriv('aes-192-cbc', key, iv)
        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return iv.toString('hex') + ':' + encrypted.toString('hex');
    }
    
    symmetricDecryption(text,password) {
        let key = crypto.scryptSync(password, 'salt', 24)
        let textParts = text.split(':');
        let iv = Buffer.from(textParts.shift(), 'hex');
        let encryptedText = Buffer.from(textParts.join(':'), 'hex');
        let decipher = crypto.createDecipheriv('aes-192-cbc', key, iv)
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted;
    }
    

}



/////////////////////////////////////////////////////////////////////////////////////
////////  This portion is only for Debuging the overall security algorithms//////////
/////////////////////////////////////////////////////////////////////////////////////
// function test(pass)
// {

//     let cs = new CryptoSecurity()
//     const {publicKey,privateKey}  = cs.getKey(pass)
//     let plaintext = 'hello '
    
//     const encryptedPrivateKey = cs.symmetricEncryption(privateKey,pass)
//     const decryptedPrivateKey = cs.symmetricDecryption(encryptedPrivateKey,pass)
//     console.log("step 01 ")
//     console.log(privateKey == decryptedPrivateKey)
//     const cipher = cs.encryption(plaintext,publicKey)
//     const decrypted = cs.decryption(cipher,decryptedPrivateKey,pass)
//     console.log(" step 1 "+decrypted)

//     const signature = cs.signing(plaintext,decryptedPrivateKey,pass)
//     const res = cs.verify(signature,plaintext,publicKey)
//     console.log("step 2 " + res)
// }
// test('pass')

module.exports = {CryptoSecurity}
