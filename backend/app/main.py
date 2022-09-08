import uvicorn as uvicorn
from fastapi import FastAPI
from fastapi.openapi.utils import get_openapi

from config import settings

from app.routers import nft_metadata


middleware = [
    # add sentry SDK into here at a later time
]


app = FastAPI(middleware=middleware)
app.include_router(nft_metadata.router)

def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title="openapi",
        version="2.5.0",
        description="openapi",
        routes=app.routes,
    )
    app.openapi_schema = openapi_schema
    return app.openapi_schema


app.openapi = custom_openapi


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        reload=True,
        port=settings.PORT,
        debug=True
    )
