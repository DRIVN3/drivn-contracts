import {Button} from "react-bootstrap";
import {useState} from "react";
import {getEarnNftTokenFullName} from "../../utils";
import './styles.css'

export const GenerateCoin = ({
                                 allTokens,
                                 isGenerating,
                                 isClaiming,
                                 onGenerate,
                             }) => {
        const [tokenOptions] = useState([...allTokens]);
        const [token, setToken] = useState(allTokens[0]?.tokenId || null);

        const handleTokenSelection = (e) => {
            const value = e.target.value;
            const newTokenId = Number(value);
            const tokenObject = allTokens.find((t) => t.tokenId === newTokenId);
            setToken(newTokenId);
        }

        return (<>
            <div className="row mt-4">
                <div className="col-12">
                    <h6>Generate and claim GTT tokens using EarnNFT:</h6>
                </div>
            </div>
            <div className="row mt-3 my-5">
                <div className="col-6 text-end fw-bold">
                    <span>Earn NFT: </span>
                    {
                        tokenOptions.length > 0 && <select
                            className="token-dropdown"
                            value={token}
                            onChange={handleTokenSelection}
                        >
                            {
                                tokenOptions.map((option) => {
                                    return <option
                                        key={option.tokenId}
                                        className="token-item"
                                        value={option.tokenId}
                                    >
                                        {getEarnNftTokenFullName(option)}
                                    </option>
                                })
                            }
                        </select>
                    }
                </div>
                <div className="col-12 pt-2">
                    <Button
                        disabled={!token || isGenerating || isClaiming}
                        className="btn-success"
                        onClick={() => {
                            if (onGenerate) {
                                onGenerate(token);
                            }
                        }}
                    >
                        {isGenerating ? 'Generating...' : 'Generate'}
                    </Button>
                </div>
            </div>
        </>);
    }
;