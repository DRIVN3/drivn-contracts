import {ethers} from 'ethers';
import {appConfig} from "../config";

export class EarnNFTContract {
    contract;

    constructor(signer) {
        this.contract = new ethers.Contract(
            appConfig.contracts.EarnNFT.address,
            appConfig.contracts.EarnNFT.abi,
            signer,
        );
    }

    balanceOf = async (address) => {
        return await this.contract.balanceOf(address);
    };

    mint = async (amount, vehicleType) => {
        return await this.contract.mint(vehicleType, {
            value: ethers.utils.parseEther(amount.toString()).toString()
        });
    };

    merge = async (token1, token2) => {
        return await this.contract.merge(token1, token2);
    };

    generate = async (token, time) => {
        return await this.contract.generate(token, time);
    };

    claim = async (token) => {
        return await this.contract.claim(token);
    };
}
