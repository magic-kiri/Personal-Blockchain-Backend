const fetch = require('node-fetch');

function postMethod(ip, port, address, data) {
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

async function syncGet(ip,port,address)
{
    try{
        const res = await fetch(`http://${ip}:${port}/${address}`)
        return {statusCode:200, body: await res.json()}
    }catch (err){
        console.log('Erro hocche: '+ err)
        return {statusCode: 404, body: err }
    }
}


module.exports = { postMethod, getMethod,syncGet}

