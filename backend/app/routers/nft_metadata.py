from fastapi import Path
from fastapi import APIRouter
from services.nft_service import get_earn_nft_metadata, get_burn_nft_metadata
from models.nft_metadata_model import NftMetadataModel

router = APIRouter(
    prefix="",
    tags=["NFT metadata"],
    responses={404: {"description": "Not found"}},
)

@router.get("/earn-nft/{token_id}", response_model=NftMetadataModel, response_model_exclude_unset=True)
async def earn_nft_metadata(
    token_id: int = Path(title="The ID of the item to get", default=0)
):
    return await get_earn_nft_metadata(token_id=token_id)


@router.get("/burn-nft/{token_id}", response_model=NftMetadataModel, response_model_exclude_unset=True)
async def burn_nft_metadata(
    token_id: int = Path(title="The ID of the item to get", default=0)
):
    return await get_burn_nft_metadata(token_id=token_id)

