

const {CryptoSecurity} = require("./security")
var sha256 = require('js-sha256')
const {Account} = require("./account")
const fetch = require('node-fetch');


const dbPort = 8080

// This function returns an account. It also creates an instance in DB
async function signUp(username,password)
{
    const response = await fetch(`http://localhost:${dbPort}/account/${username}`)
    const ret=  await response.text()

    if(ret != 'null' )
        return {status: "Already exist an account with this username"}
    let cryptoSecurity = new CryptoSecurity()
    const {privateKey, publicKey} = cryptoSecurity.getKey(password)
    
    let encryptedPrivateKey = cryptoSecurity.symmetricEncryption(privateKey,password)
    // Creating a new Account
    let account = new Account(username,password,publicKey,encryptedPrivateKey)
    
    // This portion use POST method to store an account to the database. 
    // Unhandled promise rejection... Warning
    const res = await fetch(`http://localhost:${dbPort}}/account`, {
        method: 'POST',
        body: JSON.stringify(account),
        headers: { 'Content-Type': 'application/json' }
    })
    
    return {status:"Account has been created",Account: account }
   
}

async function cmp()
{
    let node1 = await signUp("noqwasdasfascde1","pass1")
    console.log(node1.status)
    
}

cmp()




