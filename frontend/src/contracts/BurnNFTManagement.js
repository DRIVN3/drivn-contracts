import {ethers} from 'ethers';
import {appConfig} from "../config";

export class BurnNFTManagement {
    contract;

    constructor(signer) {
        this.contract = new ethers.Contract(
            appConfig.contracts.BurnNFTManagement.address,
            appConfig.contracts.BurnNFTManagement.abi,
            signer,
        );
    }

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
