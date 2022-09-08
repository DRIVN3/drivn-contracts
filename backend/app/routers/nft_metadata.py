from fastapi import Path
from fastapi import APIRouter
from services.nft_service import get_nft_count
from models.earn_nft_model import EarnNftMetadata

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

router = APIRouter(
    prefix="",
    tags=["NFT metadata"],
    responses={404: {"description": "Not found"}},
)

image_etype = {
    "CAR": "https://ipfs.io/ipfs/QmRXjo1Put4heEM1ggXYuK4RcrPS4F6KYbKrjhLT21c9V4",
    "BICYCLE": "https://ipfs.io/ipfs/QmUxSCmdSTndfnF5U8SZmU8njUNe12DWL8gye25aRx7Rge",
    "SCOOTER": "https://ipfs.io/ipfs/QmWEQrCYjygdBD2yAykTNqpHxmqRmQR7pZSTYvAXmPu8DY"
}

@router.get("/earn-nft/{token_id}", response_model=EarnNftMetadata, response_model_exclude_unset=True)
async def earn_nft_metadata(
    token_id: int = Path(title="The ID of the item to get", default=0)
):
    nft_info = await get_nft_count(token_id)

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

