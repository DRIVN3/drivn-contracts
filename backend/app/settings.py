EARN_NFT_MANAGER = "0x3Bc8Eae4FafE0e22696A2a7B09Ed0BA766B16f66"
BURN_NFT_MANAGER = "0x590370618d79eFa958C8bd985C40C8E29dF78DEc"
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
