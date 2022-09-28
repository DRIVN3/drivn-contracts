import {Contract as EthcallContract, Provider as EthcallProvider} from "ethcall"

import VestingContractAbi from '../contracts/abi/VestingWallet';


export class PrivateSalesService {

    static getVestingInfo = async (provider, contractAddresses) => {

        if (contractAddresses.length === 0) {
            return null;
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

        
        const ethcallProvider = new EthcallProvider();
        await ethcallProvider.init(provider);

        beneficiary = await ethcallProvider.tryAll(beneficiary);
        start = await ethcallProvider.tryAll(start);
        duration = await ethcallProvider.tryAll(duration);
        released = await ethcallProvider.tryAll(released);

        return beneficiary.map((item, index) => {
            return {
                beneficiaries: item,
                starts: Number(start[index].toString()),
                durations: Number(duration[index].toString()),
                released: Number(released[index].toString()),
            };
        });
    };
    
}
