import { ethers } from 'ethers';
import {appConfig} from "../config";

export class BurnNFTContract {
    contract;

    constructor(signer) {
        this.contract = new ethers.Contract(
            appConfig.contracts.BurnNFT.address,
            appConfig.contracts.BurnNFT.abi,
            signer,
        );
    }

    balanceOf = async (address) => {
        return await this.contract.balanceOf(address);
    };

    mint = async (amount) => {
        const receipt = await this.contract.mint({
            value: ethers.utils.parseEther(amount.toString()).toString()
        });
        await receipt.wait();
    };

    burn = async (tokenId, amount) => {
        const receipt = await this.contract.burn(tokenId, amount * Math.pow(10, 18));
        await receipt.wait();
    };
}
