export const getEarnNftTokenFullName = (token) => {
    const {tokenId, vehicleType, level, powerLeft, maxPower, gttCoin} = token;
    return `${tokenId} - [${vehicleType.name}, ${level.name}, power: ${powerLeft}/${maxPower}, GTT: ${gttCoin}]`;
};

export const getBurnNftTokenFullName = (token) => {
    const {tokenId, vehicleType, powerLeft, maxPower, score} = token;
    return `${tokenId} - [${vehicleType.name}, power: ${powerLeft}/${maxPower}, score: ${score}`;
};