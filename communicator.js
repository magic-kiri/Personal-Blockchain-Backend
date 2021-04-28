
const fetch = require('node-fetch');
const { postMethod, getMethod, syncGet } = require('./restMethod')

var ownIpAddress = null
var liveHosts = new Set()

// This is a list where we will knock to fetch data...
var addressList = []

const port = 4000
const searchInterval = 30

function isNodeAlive(ip) {
    // console.log(ip)
    getMethod(ip, port, ``, function callback(text) {
        if (text == 'Welcome to Personal Blockchain!')
            postMethod(ownIpAddress, port, `add_ip`, { ip: ip })
    })
}

function addIpAddress(json) {
    try {
        liveHosts.add(json.ip)
        console.log(`liveHost: ` + json.ip)
        return { statusCode: 200, body: json.ip }
    }
    catch (err) {
        return { statusCode: 200, body: err }
    }

}

async function discoverliveHosts() {
    // console.log("Discovering : ")
    liveHosts.clear();
    addressList.forEach((ip) => isNodeAlive(ip))
}

function loadAccounts() {
    addressList.forEach((ip) => {
        getMethod(ip, port, `accounts`, function callback(accounts) {
            for (let account of accounts)
                postMethod(ownIpAddress, port, `add_account`, account)
        })
    })
}

function loadTransactions() {
    addressList.forEach((ip) => {
        getMethod(ip, port, `transactions`, function callback(transactions) {
            for (let txn of transactions) {
                // console.log('load '+ ip)
                // console.log(txn.signature)
                // console.log(sha256(JSON.stringify(txn.signature)))
                const packet = { transaction: txn.transaction, signature: txn.signature }
                postMethod(ownIpAddress, port, `verify_transaction`, packet)
            }
        })
    })
}


// This function propagates the packet of transaction to all the alive host in the LAN
function propagatePacket(packet,address) {
    liveHosts.forEach((ip) => {
        try {
            postMethod(ip, port, address, packet)
        }
        catch (err) {
            console.log(`${ip} is offline!!`)
        }

    })
}

/////////////////// THIS IS A SENSITIVE PORTION //////////////
async function getAllChain(len) {
    let chains = new Set()
    for (let ip of liveHosts) {
        let res = await syncGet(ip, port, 'blockchain')
        if (res.statusCode != 200)
            continue
        chain = res.body
        if (chain.length > len)
            chains.add(chain)
    }
    return chains
}


async function comunicatorLoader() {
    // Setting own IP address
    for (i = 100; i <= 120; i++) {
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


async function searchForConsensus() {
    let consensusTime = null
    for (let ip of liveHosts) {
        if(ip==ownIpAddress)
            continue
        let res = await syncGet(ip, port, `consensus_time`)
        if(res.statusCode==200)
        {
            if(consensusTime && consensusTime<res.body)
            {
                console.log('WARNING:: consensus Time is different in different hosts')
                consensusTime = res.body
            }
            else 
                consensusTime = res.body
        }
    }
    // console.log(consensusTime)
    return consensusTime
}

function getOwnIp()
{
    return parseInt(ownIpAddress.substring(ownIpAddress.length-3))
}

module.exports = { getOwnIp,comunicatorLoader, propagatePacket, getAllChain, loadTransactions, addIpAddress, searchForConsensus };