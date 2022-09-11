import { ethers } from 'ethers';
import {appConfig} from "../config";

export class GTTBurnWalletContract {
    contract;

    constructor(signer) {
        this.contract = new ethers.Contract(
            appConfig.contracts.GTTBurnWallet.address,
            appConfig.contracts.GTTBurnWallet.abi,
            signer,
        );
    }
}
