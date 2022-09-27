import {ethers} from 'ethers';
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

    mint = async (vType) => {
        const receipt = await this.contract.mint(
            vType
        );
        await receipt.wait();
    };

    generate = async (tokenId, time) => {
        const receipt = await this.contract.generate(tokenId, time);
        await receipt.wait();
    };
}
