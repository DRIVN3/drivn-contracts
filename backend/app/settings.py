EARN_NFT_MANAGER = "0x021f85209b54248ec15134F09466C469e8f92A8c"
BURN_NFT_MANAGER = "0x78C2FD4Ebf14f76D8bD87fbf439e73B88a45226F"
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
                }
                ],
    "stateMutability": "view",
    "type": "function"
}]
