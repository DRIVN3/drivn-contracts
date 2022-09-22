EARNNFTADDRESS = "0x9bA5E7029F69Aa84400BEA52CA9d094dd7E44110"
BURNNFTADDRESS = "0x9a0D111C0eF7456C48826c920a9eDDfAdF0079cF"
MUMBAIURL = "https://matic-mumbai.chainstacklabs.com"

BurnNftAbi = [{
        "inputs": [
            {
                "internalType": "uint256", 
                "name": "", 
                "type": "uint256"
            }
        ], 
        "name": "nftPower",
        "outputs": [
            {"internalType": "uint256", 
            "name": "", 
            "type": "uint256"}
            ],
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
