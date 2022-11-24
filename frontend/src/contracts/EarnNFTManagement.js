import {ethers} from 'ethers';
import {appConfig} from "../config";

export class EarnNFTManagement {
    contract;

    constructor(signer) {
        this.contract = new ethers.Contract(
            appConfig.contracts.EarnNFTManagement.address,
            appConfig.contracts.EarnNFTManagement.abi,
            signer,
        );
    }

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

    
    generate = async (token, amount) => {
        console.log(token, amount)
        console.log("yvelaferi kargadaa")

        // console.log(await this.getSignatureData(token, amount))
        return;
        const receipt = await this.contract.generate(token, amount);
        await receipt.wait();
    };
}
