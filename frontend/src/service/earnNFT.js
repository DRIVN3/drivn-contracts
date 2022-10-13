import {Contract as EthcallContract, Provider as EthcallProvider} from "ethcall"
import {EARN_NFT_LEVELS_ARRAY, EARN_NFT_VEHICLE_TYPES_ARRAY} from "../constants";
import {appConfig} from "../config";
import {ethers} from "ethers";

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
            appConfig.contracts.EarnNFTManagement.address,
            appConfig.contracts.EarnNFTManagement.abi
        );

        const calls = tokens.map((tokenId) => contract.nftInfo(tokenId));

        const ethcallProvider = new EthcallProvider();
        await ethcallProvider.init(provider);

        const data = await ethcallProvider.tryAll(calls);

        return data.map((item, index) => {
            return {
                gttCoin: Number.parseFloat(ethers.utils.formatEther(item.powerClaimed)),
                vehicleType: {
                    type: item.eType,
                    name: EARN_NFT_VEHICLE_TYPES_ARRAY[item.eType],
                },
                level: {
                    type: item.nftType,
                    name: EARN_NFT_LEVELS_ARRAY[item.nftType],
                },
            };
        });
    };
}
