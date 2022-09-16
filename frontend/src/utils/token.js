export const getEarnNftTokenFullName = (token) => {
    const {tokenId, vehicleType, level, powerLeft, maxPower, gttCoin} = token;
    return `${tokenId} - [${vehicleType.name}, ${level.name}, power: ${powerLeft}/${maxPower}, GTT: ${gttCoin}]`;
};

export const getBurnNftTokenFullName = (token) => {
    const {tokenId, nftPower} = token;
    return `${tokenId} - [power: ${nftPower}]`;
};