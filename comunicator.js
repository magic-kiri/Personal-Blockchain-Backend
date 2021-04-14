
// var ping = require('ping');
// const isPortReachable = require('is-port-reachable');
const fetch = require('node-fetch');

var adjacentNode = new Set()
// This is a list where we will knock to fetch data...
var addressList = []
for (i = 100; i < 110; i++)
    addressList.push(`192.168.0.${i}`)

function isNodeAlive(ip) {
    fetch(`http://${ip}:${4000}`)
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

function comunicatorInit() {
    setInterval(function () { discoverAdjacentNode() }, 30 * 1000);
}





// This function propagates the packet of transaction to all the alive host in the LAN
async function propagatePacket(packet) {
    // adjacentNode.forEach( async (ip)=>{

    // })
}



module.exports = { comunicatorInit, propagatePacket };