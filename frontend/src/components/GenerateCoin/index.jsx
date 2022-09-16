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
        const [claim, setClaim] = useState(false);
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

        const handleClaimChange = (e) => {
            setClaim(e.target.checked)
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
                <div className="col-12 mt-3">
                    <label className="claim-label">
                        Claim on generate:{' '}
                        <input
                            disabled={isGenerating || isClaiming}
                            checked={claim}
                            onChange={handleClaimChange}
                            type="checkbox"
                        />
                    </label>
                </div>
                <div className="col-12 pt-2">
                    <Button
                        disabled={!token || isGenerating || isClaiming}
                        className="btn-success"
                        onClick={() => {
                            if (Number.isInteger(time) && time > 0) {
                                if (onGenerate) {
                                    onGenerate(token, time, claim);
                                }
                            } else {
                                setErrorMessage('Please input valid time.')
                            }
                        }}
                    >
                        {isGenerating ? 'Generating...' : 'Generate'}
                    </Button>
                </div>
                <div className="col-12 pt-2">
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