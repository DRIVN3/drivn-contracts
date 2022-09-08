import uvicorn as uvicorn
from fastapi import FastAPI
from fastapi.openapi.utils import get_openapi

from config import settings

from app.routers import nft_metadata

app = FastAPI()
app.include_router(nft_metadata.router)

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        reload=True,
        port=settings.PORT,
        debug=True
    )
