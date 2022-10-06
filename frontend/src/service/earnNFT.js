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
        const powerLeftCalls = tokens.map((tokenId) => contract.calculatePower(tokenId));
        const claimAmountCalls = tokens.map((tokenId) => contract.getClaimAmount(tokenId));

        const ethcallProvider = new EthcallProvider();
        await ethcallProvider.init(provider);

        const data = await ethcallProvider.tryAll(calls);
        const powerLeftData = await ethcallProvider.tryAll(powerLeftCalls);
        const claimAmountData = await ethcallProvider.tryAll(claimAmountCalls);

        return data.map((item, index) => {
            return {
                gttCoin: Number.parseFloat(ethers.utils.formatEther(claimAmountData[index].toString())),
                vehicleType: {
                    type: item.eType,
                    name: EARN_NFT_VEHICLE_TYPES_ARRAY[item.eType],
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
