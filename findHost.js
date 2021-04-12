
// var ping = require('ping');
// const isPortReachable = require('is-port-reachable');
const fetch = require('node-fetch');

var adjacentNode = new Set()
var addressList = []
for (i = 100; i < 110; i++)
    addressList.push(`192.168.0.${i}`)

function isNodeAlive(ip) {

    fetch(`http://${ip}:${4000}`)
        .catch((e)=>{})
        .then(res => res.text())
        .catch((e)=>{})
        .then((text)=>{
            if(text=='Welcome to Personal Blockchain!')
                adjacentNode.add(ip),console.log(ip)
        })
        .catch((e)=>{})
}

async function discoverAdjacentNode() {
    adjacentNode.clear();
    addressList.forEach(async function (ip) {
        isNodeAlive(ip)
    })

}

setInterval(function () { discoverAdjacentNode() }, 20 * 1000);
discoverAdjacentNode()

module.exports = { adjacentNode };