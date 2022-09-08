from web3 import Web3
from fastapi import FastAPI, Path, APIRouter
from app.settings import EARNNFTADDRESS, BURNNFTADDRESS, BurnNftAbi, EarnNft, MUMBAIURL

router = APIRouter(
    prefix="",
    tags=["NFT metadata"],
    responses={404: {"description": "Not found"}},
)

app = FastAPI()


W3_MAINNET = Web3(Web3.HTTPProvider(MUMBAIURL))
earn_nft = W3_MAINNET.eth.contract(EARNNFTADDRESS, abi=EarnNft)
burn_nft = W3_MAINNET.eth.contract(BURNNFTADDRESS, abi=BurnNftAbi)

Level  = {
    0: "COMMON",
    1: "UNCOMMON",
    2: "RARE",
    3: "EPIC"
}

EType  = {
    0: "CAR",
    1: "BICYCLE",
    2: "SCOOTER",
}

image_etype = {
    "CAR": "https://ipfs.io/ipfs/QmRXjo1Put4heEM1ggXYuK4RcrPS4F6KYbKrjhLT21c9V4",
    "BICYCLE": "https://ipfs.io/ipfs/QmUxSCmdSTndfnF5U8SZmU8njUNe12DWL8gye25aRx7Rge",
    "SCOOTER": "https://ipfs.io/ipfs/QmWEQrCYjygdBD2yAykTNqpHxmqRmQR7pZSTYvAXmPu8DY"
}


@router.get("/earn-nft/{token_id}")
async def earn_nft_metadata(
    token_id: int = Path(title="The ID of the item to get", default=0)
):
    nft_info = earn_nft.functions.nftInfo(token_id).call()

    level = Level[nft_info[0]]
    etype = EType[nft_info[1]]
    max_power = nft_info[4]

    return {
        "data": {
            "description": f'This is an example of Earn NFT {token_id}',
            "name": f'Earn NFT Example {token_id}',
            "image": image_etype[etype],
            "level": level,
            "etype": etype,
            "maxPower": max_power
        }
    }

@router.get("/burn-nft/{token_id}")
async def burn_nft_metadata(
    token_id: int = Path(title="The ID of the item to get", default=0)
):
    nft_info = burn_nft.functions.nftInfo(token_id).call()

    etype = EType[nft_info[0]]
    max_power = nft_info[3]

    return {
        "data": {
            "description": f'This is an example of BURN NFT {token_id}',
            "name": f'Earn BURN Example {token_id}',
            "image": image_etype[etype],
            "etype": etype,
            "maxPower": max_power
        }
    }

app.include_router(router)
