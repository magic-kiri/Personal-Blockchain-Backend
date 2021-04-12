

const { CryptoSecurity } = require("./security")

function createTransaction(transaction,privateKey){
    let cryptoSecurity = new CryptoSecurity()
    let signature = cryptoSecurity.signing(transaction,privateKey)
    let packet = {transaction,signature}
}

