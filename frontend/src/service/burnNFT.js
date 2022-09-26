import {Contract as EthcallContract, Provider as EthcallProvider} from "ethcall"
import {appConfig} from "../config";

export class BurnNFTService {
    static getInstance = () => {
        return new EthcallContract(
            appConfig.contracts.BurnNFT.address,
            appConfig.contracts.BurnNFT.abi
        );
    }

    static getMyTokens = async (provider, address) => {
        const contract = BurnNFTService.getInstance();

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
            appConfig.contracts.BurnNFT.address,
            appConfig.contracts.BurnNFT.abi
        );

        const calls = tokens.map((tokenId) => contract.nftInfo(tokenId));
        const powerLeftCalls = tokens.map((tokenId) => contract.calculatePower(tokenId));

        const ethcallProvider = new EthcallProvider();
        await ethcallProvider.init(provider);

        const data = await ethcallProvider.tryAll(calls);
        const powerLeftData = await ethcallProvider.tryAll(powerLeftCalls);

        console.log(data);
        return data.map((nftInfo, index) => {
            return {
                score: nftInfo.score.toString(),
                eType: nftInfo.eType.toString(),
                maxPower: Number(nftInfo.maxPower.toString()),
                powerLeft: Number(powerLeftData[index].toString()),
            };
        });
    };
}
