EARN_NFT_MANAGER = "0xC75aBb95F2d52ABf96e2743fcA9eFa4cE9c42d2e"
BURN_NFT_MANAGER = "0x713B1Ada985D7E06439f81F048d6C4ad2140a27d"
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
