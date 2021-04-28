# Personal-Blockchian-Backend
This is a Personal Blockchain backend app made in NodeJS.


## Introduction
The proposal is to build a blockchain system running on the local network.
One can run this app in his/her local machine and save data in the blockchain as a transaction. 
This will work only in a LAN.



## Technologies
* NodeJS version: 12.18.3 
* MongoDB version: 4.4.5



## Setup

1) Install [NodeJS](https://nodejs.org/en/download/) on your local machine.
2) Install [MongoDB](https://www.mongodb.com/try/download/community) for Database access.
3) Clone the repository with `git clone https://github.com/magic-kiri/Personal-Blockchian.git` the command (for windows users) in the current directory.
4) In the project directory use `npm install` command to install all the dependecies.

## Launch
1) Run `monogo.exe` file from `MongoDB\Server\4.4\bin\`
2) Go to the project directory and run it using `node app.js`
3) For better usage, you can use a frontend app [Personal Blockchain Frontend](https://github.com/arBishal/Personal-Blockchain-Frontend)

#### Warning
1) Make sure the subnet musk of the network is 255.255.255.0
2) All devices running under the same router.
3) Machines IP address should be between $.$.$.100 - $.$.$.120

## Mechanism
The proposal was to build a blockchain system running on the local network.
It communicates with other active hosts running same server on port: 4000.
One can run this app in his/her local machine and log-In/sign-Up using API.
After signing-In user can send a POST request to the server to save an **Transaction**. 
The server propagtes the transaction to all other active nodes in the network.
Every active node in the network verifies the transaction with the help of digital signature and 
if it is valid then the server will insert the transaction in its own <b> Transaction Pool </b>.

For a certain period of time every active node in the network creates an block and share it to each other.
After the time period every node gets the optimal block and they append it in thein blockchain.
There is an **Rotational Consensus Algorithm** which help every node to select a block to add in the blockchain and maintains the ledger identical.
If there are no transaction in the current block then the server discards the block.



