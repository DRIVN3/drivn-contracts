import {ethers} from 'ethers';
import {appConfig} from "../config";

export class PrivateSalesContract {
    contract;

    constructor(signer) {
        this.contract = new ethers.Contract(
            appConfig.contracts.PrivateSales.address,
            appConfig.contracts.PrivateSales.abi,
            signer,
        );
    }


    buy = async (amount) => {
        const receipt = await this.contract.buy({
            value: ethers.utils.parseEther(amount.toString()).toString()
        });
        await receipt.wait();
    };

    getAccountVestingWallets = async (account) => {
        const receipt = await this.contract.getAccountVestingWallets(account);
        return receipt;
    };
}
