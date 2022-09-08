from pydantic import BaseModel
from typing import Optional

class Data(BaseModel):
    description: str
    name: str
    image: str
    level: Optional[str]
    etype: str
    maxPower: str

    
class NftMetadataModel(BaseModel):
    data: Data

