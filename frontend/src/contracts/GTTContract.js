import { ethers } from 'ethers';
import {appConfig} from "../config";

export class GTTContract {
    contract;

    constructor(signer) {
        this.contract = new ethers.Contract(
            appConfig.contracts.GTT.address,
            appConfig.contracts.GTT.abi,
            signer,
        );
    }

    balanceOf = async (address) => {
        return await this.contract.balanceOf(address);
    };
}
