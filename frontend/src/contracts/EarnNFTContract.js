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
        const receipt = await this.contract.mint(vehicleType, {
            value: ethers.utils.parseEther(amount.toString()).toString()
        });
        await receipt.wait();
    };

    merge = async (token1, token2) => {
        const receipt = await this.contract.merge(token1, token2);
        await receipt.wait();
    };

    generate = async (token, time) => {
        const receipt = await this.contract.generate(token, time);
        await receipt.wait();
    };

    claim = async (token) => {
        const receipt = await this.contract.claim(token);
        await receipt.wait();
    };
}
