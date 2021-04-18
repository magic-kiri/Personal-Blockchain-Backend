
const fetch = require('node-fetch');
const { addAccount } = require('./accountHandler');
const { postMethod } = require('./restMethod')

var ownIpAddress = null
var liveHosts = new Set()

// This is a list where we will knock to fetch data...
var addressList = []

const port = 4000
const searchInterval = 30

function isNodeAlive(ip) {
    fetch(`http://${ip}:${port}`)
        .then(res => res.json())
        .then((text) => {
            if (text == 'Welcome to Personal Blockchain!')
                liveHosts.add(ip), console.log('liveHost: ' + ip)
        })
        .catch((e) => { })
}

async function discoverliveHosts() {
    liveHosts.clear();
    addressList.forEach((ip) => isNodeAlive(ip))
}

function loadAccounts() {
    addressList.forEach(async (ip) => {
        try {
            fetch(`http://${ip}:${port}/accounts`)
                .then(res => res.json())
                .then(accounts => {
                    accounts.forEach((account) => addAccount(account))
                })
                .catch(err => { })
        }
        catch (err) {
            console.log(err)
        }
    })
}

function loadTransactions() {
    addressList.forEach(async (ip) => {
        try {
            fetch(`http://${ip}:${port}/transactions`)
                .then(res => res.json())
                .then(async (transactions) => {
                    for (let txn of transactions) {
                        delete txn._id
                        try {
                            postMethod(ownIpAddress, port, 'verify_transaction', txn)
                            // transactionHandler.verifyTransaction(txn,txn.body.ownersPublicKey)
                        }
                        catch (err) {
                            console.log(err)
                        }
                    }
                })
                .catch(err => { })
        }
        catch (err) {
            console.log(err)
        }
    })
}


// This function propagates the packet of transaction to all the alive host in the LAN
async function propagatePacket(packet) {
    liveHosts.forEach((ip) => {
        try {
            postMethod(ip, port, 'verify_Transaction', packet)
        }
        catch (err) {
            console.log(`${ip} is offline!!`)
        }

    })
}

async function getAllChain(len) {
    let chains = new Set()

    for (let ip of liveHosts) {
        try {
            let res = await fetch(`http://${ip}:${port}/blockchain`)
            let chain = await res.json()
            if (chain.length > len)
                chains.add(chain)
        }
        catch (err) {
            // console.log(err)
        }
    }
    return chains
}


async function comunicatorLoader() {
    // Setting own IP address
    for (i = 100; i < 110; i++) {
        ip = ownIpAddress.substring(0, ownIpAddress.length - 3)
        addressList.push(ip + i)
    }
    discoverliveHosts()
    loadAccounts() // loading all local account
    loadTransactions() // loading all local transactions

    setInterval(function () { discoverliveHosts() }, searchInterval * 1000) // discovering aliveHosts after few moments
}

function comunicatorInit() {
    try {
        require('dns').lookup(require('os').hostname(), async function (err, add, fam) {
            ownIpAddress = add.toString()
            comunicatorLoader()
        })
    } catch (err) {
        console.log(`unable to get IP address of this device`)
        console.log(err)
    }
}
comunicatorInit()

module.exports = { comunicatorLoader, propagatePacket, getAllChain, loadTransactions };