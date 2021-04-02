
const findDevice = require('local-devices');
const { CryptoSecurity } = require("./security")
const { Account } = require("./account")
const fetch = require('node-fetch');
const isPortReachable = require('is-port-reachable');
const dbPort = 8080

// This function returns an account. It also creates an instance in DB
async function signUp(username, password) {

    try {
        const response = await fetch(`http://localhost:${dbPort}/account/${username}`)
        const ret = await response.text()
        if (ret != 'null')
            return { status: "Already exist an account with this username" }
    } catch (err) {
        return { status: "No such server", error: err }
    }

    let cryptoSecurity = new CryptoSecurity()
    const { privateKey, publicKey } = cryptoSecurity.getKey(password)

    let encryptedPrivateKey = cryptoSecurity.symmetricEncryption(privateKey, password)
    // Creating a new Account
    let account = new Account(username, password, publicKey, encryptedPrivateKey)

    // This portion use POST method to store an account to the database. 
    // Unhandled promise rejection... Warning
    try {
        const res = await fetch(`http://localhost:${dbPort}/account`, {
            method: 'POST',
            body: JSON.stringify(account),
            headers: { 'Content-Type': 'application/json' }
        })
    }
    catch (err) {
        return { status: "Couldn't create any account!", error: err }
    }

    return { status: "Account has been created", Account: account }
}

async function cmp() {
    let node1 = await signUp("ntaoe1", "pass1")
    console.log(node1.status)

}
cmp();


// Node Discovery:::
async function discoverAdjacentNode() {
    let adjacentNode = []
    await findDevice().then(async (devices) => {
        for (node of devices) {
            if ((await isPortReachable(dbPort, { host: node.ip }))) {
                // console.log(node.ip)
                adjacentNode.push(node.ip)
            }
        }
    })
    return adjacentNode
}


// discoverAdjacentNode().then(res => console.log(res))