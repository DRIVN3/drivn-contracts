import {Contract as EthcallContract, Provider as EthcallProvider} from "ethcall"
import {appConfig} from "../config";

export class AssetService {

    static loadAssets = async (provider, address) => {
        const contractConfigs = [
            appConfig.contracts.GTT,
            appConfig.contracts.DRVNCoin,
            appConfig.contracts.EarnNFT,
            appConfig.contracts.BurnNFT,
        ];

        const contracts = contractConfigs.map((config) => new EthcallContract(
            config.address,
            config.abi
        ));

        const balanceCalls = contracts.map((contract) => contract.balanceOf(address));

        const ethcallProvider = new EthcallProvider();
        await ethcallProvider.init(provider);

        const data = await ethcallProvider.all(balanceCalls);

        return {
            gttBalance: data[0],
            drvnCoinBalance: data[1],
            earnNFTBalance: data[2],
            burnNFTBalance: data[3],
        }
    };
}
