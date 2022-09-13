import {Button} from "react-bootstrap";
import {useState} from "react";
import {getBurnNftTokenFullName} from "../../utils";
import "./styles.css";

export const BurnNFTs = ({
                             allTokens,
                             loading,
                             onBurn,
                         }) => {
    const [tokenOptions] = useState([...allTokens]);
    const [tokenId, setTokenId] = useState(allTokens[0]?.tokenId || null);
    const [amount, setAmount] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleAmountChange = (e) => {
        const value = e.target.value;
        setAmount(Number(value));
    }

    const handleToken1Selection = (e) => {
        const value = e.target.value;
        setTokenId(Number(value));
    }

    if (allTokens.length === 0) {
        return null;
    }

    return (<>
        <div className="row w-100 mt-3">
            <h6>Burn GTT tokens using BurnNFT:</h6>
        </div>
        <div className="row w-100 mt-3">
            <div className="col-6 text-end fw-bold">
                <span>Token 1: </span>
                {
                    tokenOptions.length > 0 && <select
                        className="token-dropdown"
                        value={tokenId}
                        onChange={handleToken1Selection}
                    >
                        {
                            tokenOptions.map((option) => {
                                return <option
                                    key={option.tokenId}
                                    className="token-item"
                                    value={option.tokenId}
                                >
                                    {getBurnNftTokenFullName(option)}
                                </option>
                            })
                        }
                    </select>
                }
            </div>
            <div className="col-6 text-start fw-bold">
                <span>Amount: </span>
                <input
                    className="amount-input"
                    value={amount}
                    onChange={handleAmountChange}
                    type="number"
                    min={0}
                />
                <span className="text-danger mx-2">{errorMessage}</span>
            </div>
        </div>
        <div className="row w-100 mt-3">
            <div className="col-12">
                <Button
                    disabled={!tokenId || loading}
                    className="btn-success"
                    onClick={() => {
                        setErrorMessage('');
                        if (Number(amount) > 0) {
                            if (onBurn) {
                                onBurn(tokenId, amount);
                            }
                        } else {
                            setErrorMessage('Time must be greater than 0.');
                        }
                    }}
                >
                    {loading ? 'Burning...' : 'Burn'}
                </Button>
            </div>
        </div>
    </>);
};