from pydantic import BaseSettings


class ServerSettings(BaseSettings):
    HOST: str = "0.0.0.0"
    PORT: int = 9000
    WEBHOOKS_PORT: int = 9001

class NFTSettings(BaseSettings):
    EARNNFTADDRESS: str
    BURNNFTADDRESS: str

class Settings(ServerSettings, NFTSettings):
    class Config:
        env_file = '.env'
        env_file_encoding = 'utf-8'


settings = Settings()