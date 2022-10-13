export const getEarnNftTokenFullName = (token) => {
    const {tokenId, vehicleType, level, gttCoin} = token;
    return `${tokenId} - [${vehicleType.name}, ${level.name}, GTT Claimed: ${gttCoin}]`;
};

export const getBurnNftTokenFullName = (token) => {
    const {tokenId, vehicleType, score} = token;
    return `${tokenId} - [${vehicleType.name}, score: ${score}`;
};