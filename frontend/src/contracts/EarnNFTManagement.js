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

    // Convert a hex string to a byte array
    hexToBytes = async (hex) => {
        for (var bytes = [], c = 2; c < hex.length; c += 2)
            bytes.push(parseInt(hex.substr(c, 2), 16));
        return bytes;
    }

    generate = async (token, amount) => {
        console.log(token, amount)
        console.log("yvelaferi kargadaa")

        const url = `http://207.180.211.22:9999/testnets/generate-signature/tokenId=${token}&amount=${amount}`;
        const response = await fetch(url);
        const data = await response.json();
    
        const signature = data.signature;
        console.log(data)
        const receipt = await this.contract.generate(token, amount, this.hexToBytes(signature));
        await receipt.wait();
    };
}
