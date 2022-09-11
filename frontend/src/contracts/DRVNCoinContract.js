import { ethers } from 'ethers';
import {appConfig} from "../config";

export class DRVNCoinContract {
    contract;

    constructor(signer) {
        this.contract = new ethers.Contract(
            appConfig.contracts.DRVNCoin.address,
            appConfig.contracts.DRVNCoin.abi,
            signer,
        );
    }

    balanceOf = async (address) => {
        return await this.contract.balanceOf(address);
    };
}
