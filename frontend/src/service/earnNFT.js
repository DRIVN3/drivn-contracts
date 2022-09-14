import {Contract as EthcallContract, Provider as EthcallProvider} from "ethcall"
import {EARN_NFT_LEVELS_ARRAY, EARN_NFT_VEHICLE_TYPES_ARRAY} from "../constants";
import {appConfig} from "../config";

export class EarnNFTService {

    static getMyTokens = async (provider, address) => {
        const contract = new EthcallContract(
            appConfig.contracts.EarnNFT.address,
            appConfig.contracts.EarnNFT.abi
        );

        const calls = [];
        for (let i = 0; i < 100; i++) {
            calls.push(contract.ownerOf(i));
        }

        const ethcallProvider = new EthcallProvider();
        await ethcallProvider.init(provider);

        const data = await ethcallProvider.tryAll(calls);

        return data.map((addr, index) => addr === address ? index : null).filter((token) => token !== null);
    };

    static getTokensMetadata = async (provider, tokens) => {
        if (tokens.length === 0) {
            return null;
        }

        const contract = new EthcallContract(
            appConfig.contracts.EarnNFT.address,
            appConfig.contracts.EarnNFT.abi
        );

        const calls = tokens.map((tokenId) => contract.nftInfo(tokenId));
        const powerLeftCalls = tokens.map((tokenId) => contract.calculatePower(tokenId));

        const ethcallProvider = new EthcallProvider();
        await ethcallProvider.init(provider);

        const data = await ethcallProvider.tryAll(calls);
        const powerLeftData = await ethcallProvider.tryAll(powerLeftCalls);

        return data.map((item, index) => {
            return {
                vehicleType: {
                    type: item.vehicle,
                    name: EARN_NFT_VEHICLE_TYPES_ARRAY[item.vehicle],
                },
                level: {
                    type: item.nftType,
                    name: EARN_NFT_LEVELS_ARRAY[item.nftType],
                },
                maxPower: Number(item.maxPower.toString()),
                powerLeft: Number(powerLeftData[index].toString()),
            };
        });
    };
}
