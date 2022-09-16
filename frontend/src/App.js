import {useEffect, useState} from "react";
import {Button} from "react-bootstrap";
import {ethers} from "ethers";
import Web3Modal from "web3modal";
import {AssetService, EarnNFTService, BurnNFTService} from "./service";
import {displayAddress, getBurnNftTokenFullName, getEarnNftTokenFullName, toHex} from "./utils";
import {CHAIN, EARN_NFT_VEHICLE_TYPES} from "./constants";
import {EarnNFTContract} from "./contracts/EarnNFTContract";
import {Assets, GenerateCoin, MintButton, ReloadPageButton, MergeNFTs, Tokens} from "./components";
import {BurnNFTContract} from "./contracts/BurnNFTContract";
import {BURN_NFT_PRICE} from "./constants/burnNFT";
import {BurnNFTs} from "./components/BurnNFTs";
import {GTTContract} from "./contracts/GTTContract";
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

const web3Modal = new Web3Modal();

function App() {
    const [loadingState, setLoadingState] = useState({
        connectingWallet: false,
        loadingAssets: false,
        loadingTokens: false,
        mintingEarnNft: false,
        mintingBurnNft: false,
        burningBurnNft: false,
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
    const [earnNftTokens, setEarnNftTokens] = useState();
    const [burnNftTokens, setBurnNftTokens] = useState();
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
            await new EarnNFTContract(account.signer).claimGeneratedCoins(token);
            setLoading({claimingToken: false});
            setAccountFromProvider(account.library);
        } catch (e) {
            setLoading({claimingToken: false});
            setErrorMessage("Something went wrong. Couldn't claiming EarnNFT token.");
        }
    };

    const handleGenerateCoin = async (token, time, claim) => {
        try {
            setLoading({generatingToken: true});
            await new EarnNFTContract(account.signer).generate(token, time, claim);
            setLoading({generatingToken: false});
            setAccountFromProvider(account.library);
        } catch (e) {
            setLoading({generatingToken: false});
            setErrorMessage("Something went wrong. Couldn't generate GTT coin.");
        }
    };

    const handleBurnNftTokensBurn = async (token, amount) => {
        try {
            setLoading({burningBurnNft: true});
            await new GTTContract(account.signer).approveBurn(amount);
            await new BurnNFTContract(account.signer).burn(token, amount);
            setLoading({burningBurnNft: false});
            setAccountFromProvider(account.library);
        } catch (e) {
            setLoading({burningBurnNft: false});
            setErrorMessage("Something went wrong. Couldn't burn BurnNFT.");
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
            let metadata = [];
            if (tokens.length) {
                metadata = await EarnNFTService.getTokensMetadata(library, tokens);
                metadata = metadata.map((data, index) => {
                    data.tokenId = tokens[index]
                    return data;
                });
                setEarnNftTokens(metadata);
            }
            setLoading({loadingTokens: false});
        } catch (e) {
            setLoading({loadingTokens: false});
            setErrorMessage("Something went wrong. Couldn't load EarnNFT tokens.");
        }
    }

    const handleMintBurnNft = async (amount) => {
        try {
            setLoading({mintingBurnNft: true});
            await new BurnNFTContract(account.signer).mint(amount);
            setLoading({mintingBurnNft: false});
            setAccountFromProvider(account.library);
        } catch (e) {
            setLoading({mintingBurnNft: false});
            setErrorMessage("Something went wrong. Couldn't mint BurnNFT.");
        }
    };

    const loadBurnNFTs = async (library, address) => {
        try {
            setLoading({loadingTokens: true});
            const tokens = await BurnNFTService.getMyTokens(library, address);
            let metadata = [];
            if (tokens.length) {
                metadata = await BurnNFTService.getTokensMetadata(library, tokens);
                metadata = metadata.map((data, index) => {
                    data.tokenId = tokens[index]
                    return data;
                });
            }

            setBurnNftTokens(metadata);
            setLoading({loadingTokens: false});
        } catch (e) {
            setLoading({loadingTokens: false});
            setErrorMessage("Something went wrong. Couldn't load BurnNFT tokens.");
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
        await loadEarnNFTs(library, address);
        await loadBurnNFTs(library, address);
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
                    <h3>DRVN Demo App</h3>
                </div>
            </div>
            <div className="row">
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
            <div className="row">
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
            {account.connected && <Assets assetName="EarnNFT" assetValue={assets.earnNFT}/>}
            {
                loadingState.loadingTokens ? <div className="col-12">Loading Tokens...</div>
                    : <Tokens
                        tokens={earnNftTokens}
                        getTokenFullName={getEarnNftTokenFullName}
                    />
            }
            {
                account.connected && <div className="row">
                    <div className="col-12">
                        <h6>Mint EarnNFT:</h6>
                    </div>
                    {
                        !loadingState.loadingTokens && <>
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
                        </>
                    }
                </div>
            }
            {
                !loadingState.loadingTokens && account.connected && <MintButton
                    isSingleMint={true}
                    disabled={loadingState.mintingEarnNft}
                    price={vehicleType?.price}
                    loading={loadingState.mintingEarnNft}
                    onMint={({amount}) => {
                        handleMintEarnNft(amount, vehicleType.type);
                    }}
                />
            }

            {
                !loadingState.loadingTokens && earnNftTokens !== undefined &&
                <MergeNFTs
                    allTokens={earnNftTokens}
                    onMerge={handleMergeEarnNfts}
                    loading={loadingState.mergingEarnNft}
                />
            }
            {
                !loadingState.loadingTokens && earnNftTokens !== undefined && <GenerateCoin
                    allTokens={earnNftTokens}
                    onGenerate={handleGenerateCoin}
                    onClaim={handleClaimToken}
                    isGenerating={loadingState.generatingToken}
                    isClaiming={loadingState.claimingToken}
                />
            }
            {account.connected && <Assets assetName="BurnNFT" assetValue={assets.burnNFT}/>}
            {
                loadingState.loadingTokens ? <div className="col-12">Loading Tokens...</div>
                    : <Tokens
                        tokens={burnNftTokens}
                        getTokenFullName={getBurnNftTokenFullName}
                    />
            }
            {
                account.connected && <>
                    <div className="row">
                        <div className="col-12">
                            <h6>Mint BurnNFT:</h6>
                        </div>
                    </div>
                    {
                        !loadingState.loadingTokens && <MintButton
                            isSingleMint={true}
                            disabled={loadingState.mintingBurnNft}
                            loading={loadingState.mintingBurnNft}
                            price={BURN_NFT_PRICE}
                            onMint={({amount}) => {
                                handleMintBurnNft(amount);
                            }}
                        />
                    }
                </>
            }
            {
                !loadingState.loadingTokens && burnNftTokens !== undefined && <BurnNFTs
                    allTokens={burnNftTokens}
                    onBurn={handleBurnNftTokensBurn}
                    loading={loadingState.burningBurnNft}
                />
            }
        </div>
    );
}

export default App;