
// var ping = require('ping');
// const isPortReachable = require('is-port-reachable');
const fetch = require('node-fetch');
const {  addAccount } = require('./accountHandler');

var adjacentNode = new Set()
// This is a list where we will knock to fetch data...
var addressList = []
for (i = 100; i < 110; i++)
    addressList.push(`192.168.0.${i}`)

const port = 4000
function isNodeAlive(ip) {
    fetch(`http://${ip}:${port}`)
        .catch((e) => { })
        .then(res => res.text())
        .catch((e) => { })
        .then((text) => {
            if (text == 'Welcome to Personal Blockchain!')
                adjacentNode.add(ip), console.log(ip)
        })
        .catch((e) => { })
}

async function discoverAdjacentNode() {
    adjacentNode.clear();
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
                    accounts.forEach(  (account) =>  addAccount(account))
                })
                .catch(err=>{})
        }
        catch(err){
            console.log(err)
        }
    })
}


async function comunicatorInit() {
    discoverAdjacentNode()
    loadAccounts()
    setInterval(function () { discoverAdjacentNode() }, 30 * 1000);
}




// This function propagates the packet of transaction to all the alive host in the LAN
async function propagatePacket(packet) {
    adjacentNode.forEach(async (ip) => {
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



module.exports = { comunicatorInit, propagatePacket };