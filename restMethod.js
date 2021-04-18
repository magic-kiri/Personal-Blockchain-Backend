const fetch = require('node-fetch');

async function postMethod(ip, port, address, data) {
    try {
        fetch(`http://${ip}:${port}/${address}`, {
            method: 'post',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' },
        })
    } catch (err) {
        // console.log('error hocche : '  +  err)
    }
}


function getMethod(ip, port, address, callback) {
    try {
        fetch(`http://${ip}:${port}/${address}`)
            .then(res => res.json())
            .then(body => callback(body))
            .catch(err => { })
    } catch (err) {
        console.log('error hocche : ' + err)
    }
}


module.exports = { postMethod, getMethod }

