from fastapi import Path
from fastapi import APIRouter

router = APIRouter(
    prefix="",
    tags=["NFT metadata"],
    responses={404: {"description": "Not found"}},
)

@router.get("/earn-nft/{token_id}")
async def earn_nft_metadata(
    token_id: int = Path(title="The ID of the item to get", default=0)
):
    return "a"

