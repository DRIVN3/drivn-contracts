export const getTokenFullName = (token) => {
    const {tokenId, vehicleType, level, powerLeft, maxPower} = token;
    return `${tokenId} - [${vehicleType.name}, ${level.name}, power: ${powerLeft}/${maxPower}]`;
};