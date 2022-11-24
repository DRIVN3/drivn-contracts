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

    mint = async (amount, vType) => {
        const receipt = await this.contract.mint(
            vType, {
                value: ethers.utils.parseEther(amount.toString()).toString()
            }
        );
        await receipt.wait();
    };

    generate = async (tokenId) => {
        const receipt = await this.contract.generate(tokenId);
        await receipt.wait();
    };
}
