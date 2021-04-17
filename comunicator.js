
const fetch = require('node-fetch');
const { addAccount } = require('./accountHandler');

var liveHosts = new Set()
// This is a list where we will knock to fetch data...
var addressList = []
for (i = 100; i < 110; i++)
    addressList.push(`192.168.0.${i}`)

const port = 4000
const searchInterval = 30

function isNodeAlive(ip) {
    fetch(`http://${ip}:${port}`)
        .catch((e) => { })
        .then(res => res.text())
        .catch((e) => { })
        .then((text) => {
            if (text == 'Welcome to Personal Blockchain!')
                liveHosts.add(ip), console.log(ip)
        })
        .catch((e) => { })
}

async function discoverliveHosts() {
    liveHosts.clear();
    addressList.forEach(async function (ip) {
        isNodeAlive(ip)
    })

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

async function loadTransactions(){
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

async function comunicatorInit() {
    discoverliveHosts()
    loadAccounts()
    loadTransactions()
    setInterval(function () { discoverliveHosts() }, searchInterval * 1000);
}




// This function propagates the packet of transaction to all the alive host in the LAN
async function propagatePacket(packet) {
    liveHosts.forEach( (ip) => {
        try {
            fetch(`http://${ip}:${port}/verify_transaction`, {
                method: 'post',
                body: JSON.stringify(packet),
                headers: { 'Content-Type': 'application/json' },
            })
        }
        catch (err) {
            console.log(`${ip} is offline!!`)
        }

    })
}

async function getAllChain(len) {
    let chains = new Set()
    
    for(let ip of liveHosts) {
        try {
            let res = await fetch(`http://${ip}:${port}/blockchain`)
            let chain = await res.json()
            // console.log(chain)
                if (chain.length > len)
                   chains.add(chain)
        }
        catch (err) {
            // console.log(err)
        }
    }
    return chains
}



module.exports = { comunicatorInit, propagatePacket, getAllChain };