EARNNFTADDRESS = "0x21ba97CACE3DD4201aeeEC39E51906926C19f348"
BURNNFTADDRESS = "0xD60165ca3A32Ed5c1F14CDb2D70d72eEEE55A006"
MUMBAIURL = "https://matic-mumbai.chainstacklabs.com"

BurnNftAbi = [{
    "inputs": [{
        "internalType": "uint256",
        "name": "",
                "type": "uint256"
    }],
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
