from web3 import Web3
from fastapi import FastAPI, Path, APIRouter
from app.settings import EARN_NFT_MANAGER, BURN_NFT_MANAGER, BurnNftAbi, EarnNft, MUMBAIURL
import random

router = APIRouter(
    prefix="",
    tags=["NFT metadata"],
    responses={404: {"description": "Not found"}},
)

app = FastAPI()


W3_MAINNET = Web3(Web3.HTTPProvider(MUMBAIURL))
earn_nft = W3_MAINNET.eth.contract(EARN_NFT_MANAGER, abi=EarnNft)
burn_nft = W3_MAINNET.eth.contract(BURN_NFT_MANAGER, abi=BurnNftAbi)

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
    "CAR": "https://ipfs.io/ipfs/QmNnjnPmYn7yFPj7mtx9cw7rQdR81rFK1Z7Fvs4Drvr8i6",
    "BICYCLE": "https://ipfs.io/ipfs/QmTWg6UwCE4Tyt9nUyS4kyRMnJXJx1QrW7VxSaduFX5tcU",
    "SCOOTER": "https://ipfs.io/ipfs/QmUEXkGdnuPEAAYpVKqUswYV1U9xiiQhG2BsLhuFKbTTJs"
}

LevelPower = {
    "COMMON": 900,
    "UNCOMMON": 1800,
    "RARE": 2700,
    "EPIC": 3600
}

@router.get("/testnets/earn-nft/{token_id}")
async def earn_nft_metadata(
    token_id: int = Path(title="The ID of the item to get", default=0)
):
    nft_info = earn_nft.functions.nftInfo(token_id).call()

    level = Level[nft_info[0]]
    etype = EType[nft_info[1]]

    return {
            "description": f'This is an example of Earn NFT {token_id}',
            "name": f'Earn NFT Example {token_id}',
            "image": image_etype[etype],
            "attributes": [
                {
                    "trait_type": "Level", 
                    "value": level
                }, 
                {
                    "trait_type": 'EType', 
                    "value": etype
                }, 
                {
                    "trait_type": 'MaxPower', 
                    "value": LevelPower[level]
                }, 
                {
                    "trait_type": 'PowerLeft', 
                    "value": random.randint(0, LevelPower[level])
                }, 
            ]
        }
    

@router.get("/testnets/burn-nft/{token_id}")
async def burn_nft_metadata(
    token_id: int = Path(title="The ID of the item to get", default=0)
):
    nft_info = burn_nft.functions.nftInfo(token_id).call()
    
    etype = EType[nft_info[0]]
    score = nft_info[1]

    return {
            "name": f'Earn BURN Example {token_id}',
            "description": f'This is an example of BURN NFT {token_id}',
            "image": image_etype[etype],
            "attributes": [
                {
                    "trait_type": 'EType', 
                    "value": etype
                }, 
                {
                    "trait_type": 'MaxPower', 
                    "value": LevelPower["COMMON"]
                }, 
                {
                    "trait_type": 'PowerLeft', 
                    "value": random.randint(0, LevelPower["COMMON"])
                }, 
                {
                    "trait_type": "score", 
                    "value": score / 10**18
                }
            ]
        }
@router.get("/testnets/generated-token-gtt/{token_id}")
async def generated_token_GTT(
    token_id: int = Path(title="The ID of the item to get", default=0)
):

    return {
        "GTT": (token_id % 4) * 10**18,
        "tokenId": token_id
    }


app.include_router(router)
