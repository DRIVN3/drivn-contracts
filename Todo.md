###  Todo GTT
- enable setting burn wallet in GTT +
- separate BurnWallet and GTT +
- rename airdrop --> distribute +
- change airdrop parameters like (address addr, uint256 amount) +
- change setAllowed parameters (address addr, bool allowed) +

###  Todo DRVN
- refactor numbers with _ example 5000000 = 5_000_000 + 
- remove this require(contractAddress_ != address(0), "DRVN: should not send to zero address");  +
- extend governance
- test governance  integration with tally

### DRVN Manager
- review teamSupply
- add other vesting contracts 


### Earn NFT
- change vehicle into eType for better understanding (refactor) +
- research how can we handle logic in another library or contract (researched)
- convert ENUMS into uint256 to add simpler way +
- Merge event does not throw new token id +
- setAllowed change parameters (address addr, bool allowed) +
- in generate function decrease power regarding seconds. +
- merge claim and generate. + 


### Burn NFT
- remove etype from this + 
- კონტრაქტი იღებს შენ GTT ტოკენებს დაწვავს და რამდენიც დაწვა დაამატებს power-ში. +
