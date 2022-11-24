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

    generate = async (tokenId, amount) => {
        const url = `http://207.180.211.22:9999/testnets/generate-signature/tokenId=${tokenId}&amount=${amount}`;
        const response = await fetch(url);
        const data = await response.json();
    
        const signature = data.signature;
        const receipt = await this.contract.generate(tokenId, amount, signature);
        await receipt.wait();
    };
}
