import {useEffect, useState} from "react";
import {ethers} from "ethers";
import Web3Modal from "web3modal";
import {AssetService} from "../../service";
import {toHex} from "../../utils";
import {CHAIN} from "../../constants";
import {PrivateSalesContract} from '../../contracts/PrivateSalesContract'

import {
    AccountInfo,
    Assets,
    ConnectButton,
    ReloadPageButton,
    MintPrivateSales,
    PrivateSalesVestingWallets,
} from "../";
import 'bootstrap/dist/css/bootstrap.min.css';
import {PrivateSalesService} from "../../service";

const web3Modal = new Web3Modal();

export const PrivateSales = () => {
        
    const [loadingState, setLoadingState] = useState({
        connectingWallet: false,
        loadingAssets: false,
        mintingPrivateSales: false,    
        release: false,
    });
    const [isWalletInstalled, setIsWalletInstalled] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [account, setAccount] = useState({
        connected: false
    });
    const [assets, setAssets] = useState({});

    useEffect(() => {
        web3Modal.clearCachedProvider();
        if (typeof window.ethereum !== 'undefined') {
            setIsWalletInstalled(true);
        }
    }, []);

    const setLoading = (data) => {
        setLoadingState({
            ...loadingState,
            ...data
        });
    };
    
    const handleMintPrivateSales = async (amount) => {
        try {
            setLoading({mintingPrivateSales: true});
            await new PrivateSalesContract(account.signer).buy(amount);
            setLoading({mintingPrivateSales: false});
            setAccountFromProvider(account.library);
        } catch (e) {
            setLoading({mintingPrivateSales: false});
            setErrorMessage("Something went wrong. Couldn't mint private sales");
        }
    };

    const handleOnRelease = async (contractAddress) => {
        try {
            setLoading({release: true});
            await PrivateSalesService.release(account.signer, contractAddress);
            setLoading({release: false});
            setAccountFromProvider(account.library);
        } catch (e) {
            setLoading({release: false});
            setErrorMessage("Something went wrong. Couldn't release the vest wallet");
        }
    };

    const getVestWallets = async () => {
        try {
            const vestWallets = await new PrivateSalesContract(account.signer).getAccountVestingWallets(account.address);
            return PrivateSalesService.getVestingInfo(account.library, vestWallets); 
        } catch (e) {
            setErrorMessage("Something went wrong. Couldn't get vest wallet info");
        }
    };


    const loadAllAssets = async (library, address) => {
        try {
            setLoading({loadingAssets: true});
            const result = await AssetService.loadAssets(library, address);
            const {
                gttBalance,
                drvnCoinBalance,
                earnNFTBalance,
                burnNFTBalance,
            } = result;
            setAssets({
                gttCoin: Number.parseFloat(ethers.utils.formatEther(gttBalance)),
                drvnCoin: ethers.utils.formatEther(drvnCoinBalance),
                earnNFT: earnNFTBalance.toString(),
                burnNFT: burnNFTBalance.toString(),
            });
            setLoading({loadingAssets: false});
        } catch (e) {
            setLoading({loadingAssets: false});
            setErrorMessage("Something went wrong. Couldn't load assets.");
        }
    }

    const switchNetwork = async (library) => {
        try {
            await library.provider.request({
                method: "wallet_switchEthereumChain",
                params: [{chainId: toHex(CHAIN.id)}]
            });
        } catch (switchError) {
            setErrorMessage(`Something went wrong, couldn't switch to ${CHAIN.name} network. Please reload the page.`)
        }
    };

    const setAccountFromProvider = async (library) => {
        const signer = library.getSigner();
        const address = await signer.getAddress();
        const balance = await signer.getBalance();
        const network = await library.getNetwork();

        if (toHex(network.chainId) !== CHAIN.id) {
            await switchNetwork(library);
            return;
        }

        setAccount({
            connected: true,
            library,
            signer,
            address,
            network: network.name,
            chainId: network.chainId,
            balance: ethers.utils.formatEther(balance)
        });

        await loadAllAssets(library, address);
    };

    const connectWallet = async () => {
        try {
            setErrorMessage("");
            setLoading({connectingWallet: true});

            const provider = await web3Modal.connect();
            const library = new ethers.providers.Web3Provider(provider);

            await setAccountFromProvider(library);

            setLoading({connectingWallet: false});

            provider.on("accountsChanged", () => {
                window.location.reload();
            });

            provider.on("chainChanged", (chainId) => {
                window.location.reload();
            });
        } catch (e) {
            setLoading({connectingWallet: false});
            setErrorMessage("Something went wrong, please reload page and try again.");
        }
    };

    if (!isWalletInstalled) {
        return <div className="container-fluid p-5 text-center">
            <div className="col-12">
                <h3>You need ethereum wallet</h3>
            </div>
        </div>;
    }

    return (
        <div className="container-fluid pt-2 pb-5 text-center">
            <div className="row">
                <div className="col-12">
                    <h3>DRVN Demo App Private Sales</h3>
                </div>
            </div>
            <AccountInfo
                account={account}
                setErrorMessage={setErrorMessage}
            />
            <ConnectButton
                isConnected={account.connected}
                loading={loadingState.connectingWallet}
                onConnect={connectWallet}
            />
            <div className="row my-2">
                <div className="col-12 text-danger">
                    {errorMessage}
                </div>
            </div>
            {
                errorMessage && <ReloadPageButton/>
            }
            {
                loadingState.loadingAssets && <div className="col-12">Loading Assets...</div>
            }
            {
                account.connected && <div className="row mt-4">
                    <div className="col-12">
                        <h4>Assets</h4>
                    </div>
                </div>
            }
            {account.connected && <Assets assetName="GTT coin" assetValue={assets.gttCoin}/>}
            {account.connected && <Assets assetName="DRVN coin" assetValue={assets.drvnCoin}/>}
            {
                
                    account.connected 
                    && <MintPrivateSales
                    disabled={loadingState.mintingPrivateSales}
                    loading={loadingState.mintingPrivateSales}
                    onMint={({amount}) => {
                        handleMintPrivateSales(amount);
                    }}
                />
            }
            {
                account.connected
                &&
                <PrivateSalesVestingWallets 
                    onRelease={handleOnRelease}
                    getVestWallets={getVestWallets}
                    disabled={loadingState.release}
                    loading={loadingState.release}
                />
            }
        </div>

    );
}
