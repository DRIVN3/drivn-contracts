import {useEffect, useState} from "react";
import {Button} from "react-bootstrap";
import {ethers} from "ethers";
import Web3Modal from "web3modal";
import {AssetService, EarnNFTService} from "./service";
import {displayAddress, toHex} from "./utils";
import {CHAIN, EARN_NFT_VEHICLE_TYPES} from "./constants";
import {EarnNFTContract} from "./contracts/EarnNFTContract";
import {Assets, GenerateCoin, MintButton, ReloadPageButton, MergeNFTs, Tokens} from "./components";
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

const web3Modal = new Web3Modal();

function App() {
    const [loadingState, setLoadingState] = useState({
        connectingWallet: false,
        loadingAssets: false,
        loadingTokens: false,
        mintingEarnNft: false,
        mergingEarnNft: false,
        generatingToken: false,
        claimingToken: false,
    });
    const [isWalletInstalled, setIsWalletInstalled] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [account, setAccount] = useState({
        connected: false
    });
    const [assets, setAssets] = useState({});
    const [tokens, setTokens] = useState({});
    const [vehicleType, setVehicleType] = useState(EARN_NFT_VEHICLE_TYPES[0]);

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

    const handleCopyAddress = async () => {
        try {
            await navigator.clipboard.writeText(account.address);
        } catch (e) {
            setErrorMessage("Something went wrong. Couldn't copy account address.");
        }
    }

    const handleClaimToken = async (token) => {
        try {
            setLoading({claimingToken: true});
            await new EarnNFTContract(account.signer).claim(token);
            setLoading({claimingToken: false});
            setAccountFromProvider(account.library);
        } catch (e) {
            setLoading({claimingToken: false});
            setErrorMessage("Something went wrong. Couldn't claiming EarnNFT token.");
        }
    };

    const handleGenerateCoin = async (token, time) => {
        try {
            setLoading({generatingToken: true});
            await new EarnNFTContract(account.signer).generate(token, time);
            setLoading({generatingToken: false});
            setAccountFromProvider(account.library);
        } catch (e) {
            setLoading({generatingToken: false});
            setErrorMessage("Something went wrong. Couldn't generate GTT coin.");
        }
    };

    const handleMergeEarnNfts = async (token1, token2) => {
        try {
            setLoading({mergingEarnNft: true});
            await new EarnNFTContract(account.signer).merge(token1, token2);
            setLoading({mergingEarnNft: false});
            setAccountFromProvider(account.library);
        } catch (e) {
            setLoading({mergingEarnNft: false});
            setErrorMessage("Something went wrong. Couldn't merge EarnNFTs.");
        }
    };

    const handleMintEarnNft = async (amount, vType) => {
        try {
            setLoading({mintingEarnNft: true});
            await new EarnNFTContract(account.signer).mint(amount, vType);
            setLoading({mintingEarnNft: false});
            setAccountFromProvider(account.library);
        } catch (e) {
            setLoading({mintingEarnNft: false});
            setErrorMessage("Something went wrong. Couldn't mint EarnNFT.");
        }
    };

    const loadEarnNFTs = async (library, address) => {
        try {
            setLoading({loadingTokens: true});
            const tokens = await EarnNFTService.getMyTokens(library, address);
            let metadata = await EarnNFTService.getTokensMetadata(library, tokens);
            metadata = metadata.map((data, index) => {
                data.tokenId = tokens[index]
                return data;
            });
            setTokens({
                earnNFT: metadata,
            });
            setLoading({loadingTokens: false});
        } catch (e) {
            setLoading({loadingTokens: false});
            setErrorMessage("Something went wrong. Couldn't load EarnNFT tokens.");
        }
    }

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
                gttCoin: gttBalance.toString(),
                drvnCoin: drvnCoinBalance.toString(),
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
        await loadEarnNFTs(library, address);
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
        <div className="accounts-container">
            <div className="row w-100">
                <div className="col-12">
                    <h3>DRVN Demo App</h3>
                </div>
            </div>
            <div className="row w-100">
                {
                    account.connected ? <>
                        <div className="col-12">
                            <h4>Account</h4>
                        </div>
                        <div className="col-6 text-end fw-bold">Network:</div>
                        <div className="col-6 text-start">
                            {`${account.chainId} - ${account.network}`}
                        </div>
                        <div className="col-6 text-end fw-bold">Address:</div>
                        <div className="col-6 text-start">
                            {displayAddress(account.address)}
                            <Button
                                title="Copy Address"
                                onClick={handleCopyAddress}
                                className="btn-sm btn-secondary mx-1"
                            >
                                Copy
                            </Button>
                        </div>
                        <div className="col-6 text-end fw-bold">Balance:</div>
                        <div className="col-6 text-start">
                            {account.balance}{' '}<b>{CHAIN.currency}</b>
                        </div>
                    </> : <div className="col-12">Account not connected</div>
                }
            </div>
            <div className="row w-100">
                {
                    (!account.connected || loadingState.connectingWallet) && <div className="col-12 mt-3">
                        <Button
                            disabled={!!account.connected || loadingState.connectingWallet}
                            className={(account.connected || loadingState.connectingWallet) ? "btn-secondary" : "btn-success"}
                            onClick={() => {
                                connectWallet();
                            }}
                        >
                            {loadingState.connectingWallet ? 'Connecting...' : 'Connect to Wallet'}
                        </Button>
                    </div>
                }
            </div>
            <div className="col-12 text-danger">
                {errorMessage}
            </div>
            {
                errorMessage && <ReloadPageButton/>
            }
            {
                account.connected ?
                    <div className="row w-100">
                        <div className="col-12 mt-3">
                            <h4>Assets</h4>
                        </div>
                        {
                            loadingState.loadingAssets ? <div className="col-12">Loading Assets...</div> :
                                <div className="col-12">
                                    <Assets assetName="GTT coin" assetValue={assets.gttCoin}/>
                                    <Assets assetName="DRVN coin" assetValue={assets.drvnCoin}/>
                                    <Assets assetName="EarnNFT" assetValue={assets.earnNFT}/>
                                    <Assets assetName="BurnNFT" assetValue={assets.burnNFT}/>
                                </div>
                        }
                    </div> : null
            }
            {
                !loadingState.loadingTokens && tokens.earnNFT !== undefined &&
                <>
                    <div className="row w-100">
                        <div className="col-12 mt-3">
                            <h4>GTT Coins</h4>
                        </div>
                    </div>
                    <GenerateCoin
                        allTokens={tokens.earnNFT}
                        onGenerate={handleGenerateCoin}
                        onClaim={handleClaimToken}
                        isGenerating={loadingState.generatingToken}
                        isClaiming={loadingState.claimingToken}
                    />
                </>

            }
            {
                account.connected &&
                <div className="row w-100">
                    <div className="col-12 mt-3">
                        <h4>EarnNFT Tokens</h4>
                    </div>
                    {
                        loadingState.loadingTokens ? <div className="col-12">Loading Tokens...</div>
                            : <Tokens tokens={tokens.earnNFT}/>
                    }
                    {
                        !loadingState.loadingTokens && <>
                            <div className="row w-100">
                                <div className="col text-end fw-bold">Vehicle Type:</div>
                                <div className="col-auto text-start">
                                    <select
                                        className="vehicle-type-dropdown"
                                        value={vehicleType.type}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            const vType = EARN_NFT_VEHICLE_TYPES.find((v) => v.type === Number(value));
                                            setVehicleType(vType);
                                        }}
                                    >
                                        {
                                            EARN_NFT_VEHICLE_TYPES.map((vType) => {
                                                return <option
                                                    key={vType.type}
                                                    className="vehicle-type-item"
                                                    value={vType.type}
                                                >
                                                    {vType.name}
                                                </option>
                                            })
                                        }
                                    </select>
                                </div>
                                <div className="col text-start">
                                    <b>{'Price: '}</b>{vehicleType?.price}<b>{' '}{CHAIN.currency}</b>
                                </div>
                            </div>
                            <MintButton
                                isSingleMint={true}
                                disabled={loadingState.mintingEarnNft}
                                price={vehicleType?.price}
                                loading={loadingState.mintingEarnNft}
                                onMint={({amount}) => {
                                    handleMintEarnNft(amount, vehicleType.type);
                                }}
                            />
                        </>
                    }

                    {
                        !loadingState.loadingTokens && tokens.earnNFT !== undefined &&
                        <MergeNFTs
                            allTokens={tokens.earnNFT}
                            onMerge={handleMergeEarnNfts}
                            loading={loadingState.mergingEarnNft}
                        />
                    }
                </div>
            }
        </div>
    );
}

export default App;
