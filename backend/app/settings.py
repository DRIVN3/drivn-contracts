EARNNFTADDRESS = "0x79A8A13c279FCb605E7410fAce6c3C9023039bAc"
BURNNFTADDRESS = "0x79E2941C694f01173343f36908dCDD4b54EabD26"
MUMBAIURL = "https://matic-mumbai.chainstacklabs.com"

BurnNftAbi = [{
        "inputs": [
            {
                "internalType": "uint256", 
                "name": "", 
                "type": "uint256"
            }
        ], 
        "name": "nftInfo",
    "outputs": [{
            "internalType": "enum EType",
            "name": "vehicle",
                "type": "uint8"
                }, {
            "internalType": "uint256",
            "name": "lastUsage",
                "type": "uint256"
                }, {
            "internalType": "uint256",
            "name": "powerLeft",
                "type": "uint256"
                }, {
            "internalType": "uint256",
            "name": "maxPower",
                "type": "uint256"
            },
            {
                "name": "score",
                "type": "uint256"
            }],
        "stateMutability": "view",
        "type": "function"
    }]

EarnNft = [{
    "inputs": [{
        "internalType": "uint256",
        "name": "",
                "type": "uint256"
    }],
    "name": "nftInfo",
    "outputs": [{
            "internalType": "enum Level",
                "name": "nftType",
                "type": "uint8"
                }, {
            "internalType": "enum EType",
            "name": "vehicle",
                "type": "uint8"
                }, {
            "internalType": "uint256",
            "name": "lastUsage",
                "type": "uint256"
                }, {
            "internalType": "uint256",
            "name": "powerLeft",
                "type": "uint256"
                }, {
            "internalType": "uint256",
            "name": "maxPower",
                "type": "uint256"
                }],
    "stateMutability": "view",
    "type": "function"
}]
