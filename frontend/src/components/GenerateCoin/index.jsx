import {Button} from "react-bootstrap";
import {useState} from "react";
import {getEarnNftTokenFullName} from "../../utils";
import './styles.css'

export const GenerateCoin = ({
                                 allTokens,
                                 isGenerating,
                                 isClaiming,
                                 onGenerate,
                                 onClaim,
                             }) => {
        const [tokenOptions] = useState([...allTokens]);
        const [token, setToken] = useState(allTokens[0]?.tokenId || null);
        const [maxPower, setMaxPower] = useState(allTokens[0]?.powerLeft);
        const [time, setTime] = useState('');
        const [errorMessage, setErrorMessage] = useState('');

        const handleTokenSelection = (e) => {
            const value = e.target.value;
            const newTokenId = Number(value);
            const tokenObject = allTokens.find((t) => t.tokenId === newTokenId);
            setMaxPower(tokenObject.powerLeft);
            setToken(newTokenId);
        }

        const handleTimeChange = (e) => {
            const value = e.target.value;
            if (Number(value) <= maxPower) {
                setErrorMessage('');
                setTime(Number(value));
            } else {
                setErrorMessage('Time can\'t be greater than token powerLeft.');
            }
        }

        return (<>
            <div className="row w-100 mt-4">
                <h6>Generate and claim GTT tokens using EarnNFT:</h6>
            </div>
            <div className="row w-100 mt-3">
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
                <div className="col-6 text-start fw-bold">
                    <span>Time: </span>
                    <input
                        className="time-input"
                        value={time}
                        onChange={handleTimeChange}
                        type="number"
                        max={maxPower}
                        min={1}
                    />
                    <span className="text-danger mx-2">{errorMessage}</span>
                </div>
            </div>
            <div className="row w-100 p-3">
                <div className="col-6 pt-2 text-end">
                    <Button
                        disabled={!token || isGenerating || isClaiming}
                        className="btn-success"
                        onClick={() => {
                            if (Number.isInteger(time) && time > 0) {
                                if (onGenerate) {
                                    onGenerate(token, time);
                                }
                            } else {
                                setErrorMessage('Please input valid time.')
                            }
                        }}
                    >
                        {isGenerating ? 'Generating...' : 'Generate'}
                    </Button>
                </div>
                <div className="col-6 pt-2 text-start">
                    <Button
                        disabled={!token || isGenerating || isClaiming}
                        className="btn-info"
                        onClick={() => {
                            if (onClaim) {
                                onClaim(token);
                            }
                        }}
                    >
                        {isClaiming ? 'Claiming...' : 'Claim'}
                    </Button>
                </div>
            </div>
        </>);
    }
;