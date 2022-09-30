import GTTAbi from '../contracts/abi/GTT.json';
import GTTBurnWalletAbi from '../contracts/abi/GTTBurnWallet.json';
import DRVNCoinAbi from '../contracts/abi/DRVNCoin.json';
import BurnNFTAbi from '../contracts/abi/BurnNFT.json';
import EarnNFTAbi from '../contracts/abi/EarnNFT.json';
import PrivateSalesAbi from '../contracts/abi/PrivateSales.json';

export const appConfig = {
    contracts: {
        GTT: {
            address: process.env.REACT_APP_GTT_ADDRESS,
            abi: GTTAbi
        },
        GTTBurnWallet: {
            address: process.env.REACT_APP_GTT_BURN_WALLET_ADDRESS,
            abi: GTTBurnWalletAbi
        },
        DRVNCoin: {
            address: process.env.REACT_APP_DRVN_COIN_ADDRESS,
            abi: DRVNCoinAbi
        },
        BurnNFT: {
            address: process.env.REACT_APP_BURN_NFT_ADDRESS,
            abi: BurnNFTAbi
        },
        EarnNFT: {
            address: process.env.REACT_APP_EARN_NFT_ADDRESS,
            abi: EarnNFTAbi
        },
        PrivateSales: {
            address: process.env.REACT_APP_PRIVATE_SALES_ADDRESS,
            abi: PrivateSalesAbi
        },
    }
}