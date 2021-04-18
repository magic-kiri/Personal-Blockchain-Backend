
const { Console } = require('console');
const fetch = require('node-fetch');
const { addAccount } = require('./accountHandler');
const { postMethod ,getMethod} = require('./restMethod')

var ownIpAddress = null
var liveHosts = new Set()

// This is a list where we will knock to fetch data...
var addressList = []

const port = 4000
const searchInterval = 30

function isNodeAlive(ip) {
    getMethod(ip,port,``,function callback(text){
        if(text =='Welcome to Personal Blockchain!')
                postMethod(ownIpAddress,port,`add_ip`,{ip: ip})
    })
}

function addIpAddress(json)
{
    try{
        liveHosts.add(json.ip)
        console.log(`liveHost: ` + json.ip)
        return {statusCode: 200,body: json.ip}
    }
    catch(err){
        return {statusCode: 200,body: err}
    }
        
}

async function discoverliveHosts() {
    liveHosts.clear();
    addressList.forEach((ip) => isNodeAlive(ip))
}

function loadAccounts() {
    addressList.forEach((ip)=>{
        getMethod(ip,port,`accounts`,  function callback(accounts){
            for(let account of accounts)
                postMethod(ip,port,`add_account`,account)
        } )
    })
}

function loadTransactions() {
    addressList.forEach((ip)=>{
        getMethod(ip,port,`transactions`,  function callback(transactions){
            for(let txn of transactions)
            {
                delete txn._id
                postMethod(ip,port,`verify_transaction`,txn)
            }
        } )
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

/////////////////// THIS IS A SENSITIVE PORTION //////////////
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

module.exports = { comunicatorLoader, propagatePacket, getAllChain, loadTransactions, addIpAddress };