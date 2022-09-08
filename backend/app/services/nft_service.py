import json
from web3 import Web3
from config import settings

W3_MAINNET = Web3(Web3.HTTPProvider("https://matic-mumbai.chainstacklabs.com"))
earn_nft = W3_MAINNET.eth.contract(settings.EARNNFTADDRESS, abi=json.loads(open("app/services/ABI/EarnNftAbi.js").readline()))

async def get_nft_count(token_id):
    return earn_nft.functions.nftInfo(token_id).call()