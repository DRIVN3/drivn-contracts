from pydantic import BaseModel

class Data(BaseModel):
    description: str
    name: str
    image: str
    level: str
    etype: str
    maxPower: str

    
class EarnNftMetadata(BaseModel):
    data: Data
