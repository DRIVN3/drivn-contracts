import {Contract as EthcallContract, Provider as EthcallProvider} from "ethcall"
import {ethers} from 'ethers';

import VestingContractAbi from '../contracts/abi/VestingWallet'
import {appConfig} from "../config";

export class PrivateSalesService {
    
    static getVestingInfo = async (provider, contractAddresses) => {

        if (contractAddresses.length === 0) {
            return [];
        }

        let beneficiary = contractAddresses.map((contractAddress) => {
            const contract = new EthcallContract(
                contractAddress,
                VestingContractAbi
            );    
            return contract.beneficiary();
        });

        let start = contractAddresses.map((contractAddress) => {
            const contract = new EthcallContract(
                contractAddress,
                VestingContractAbi
            );    
            return contract.start();
        });

        let duration = contractAddresses.map((contractAddress) => {
            const contract = new EthcallContract(
                contractAddress,
                VestingContractAbi
            );    
            return contract.duration();
        });

        let released = contractAddresses.map((contractAddress) => {
            const contract = new EthcallContract(
                contractAddress,
                VestingContractAbi
            );    
            return contract.released();
        });

        const DRVNContract = new EthcallContract(
            appConfig.contracts.DRVNCoin.address,
            appConfig.contracts.DRVNCoin.abi
        );

        let balances = contractAddresses.map((contractAddress) => {
            return DRVNContract.balanceOf(contractAddress);
        });


        const ethcallProvider = new EthcallProvider();
        await ethcallProvider.init(provider);

        beneficiary = await ethcallProvider.tryAll(beneficiary);
        start = await ethcallProvider.tryAll(start);
        duration = await ethcallProvider.tryAll(duration);
        released = await ethcallProvider.tryAll(released);
        balances = await ethcallProvider.tryAll(balances);

        return beneficiary.map((item, index) => {
            return {
                contractAddress: contractAddresses[index],
                beneficiary: item,
                start: Number(start[index].toString()),
                duration: Number(duration[index].toString()),
                released: Number(released[index].toString()),
                balance: Number(balances[index].toString()),
            };
        });
    };

    static release = async (signer, contractAddress) => {
        const contract = new ethers.Contract(
            contractAddress,
            VestingContractAbi,
            signer,
        );

        const receipt = await contract.release();
        await receipt.wait();
    };
}
