import {BigNumber, ethers} from 'ethers';
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

    burn = async (tokenId, amount) => {
        const receipt = await this.contract.burn(tokenId, BigNumber.from(String(amount * Math.pow(10, 18))));
        await receipt.wait();
    };
}
