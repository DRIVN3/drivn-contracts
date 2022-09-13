import {Button} from "react-bootstrap";
import {useState} from "react";
import {CHAIN} from "../../constants";
import './styles.css'

export const MintButton = ({
                               isSingleMint = false,
                               price,
                               defaultCount = 1,
                               maxCount,
                               onMint,
                               disabled,
                               loading,
                           }) => {

        const [count, setCount] = useState(defaultCount);

        const handleDecrement = () => {
            if (count > 1) {
                setCount(count - 1);
            }
        }

        const handleIncrement = () => {
            if (maxCount) {
                if (count < maxCount) {
                    setCount(count + 1);
                }
            } else {
                setCount(count + 1);
            }
        }

        return (<div className="row mt-3">
            {
                !isSingleMint && <>
                    <div className="col text-end">
                        <Button
                            disabled={disabled || count === 1}
                            className="btn-secondary mint-button"
                            onClick={handleDecrement}
                        >
                            {' - '}
                        </Button>
                    </div>
                    <div className="col-1 p-1">
                        <input
                            className="mint-input"
                            readOnly={true}
                            value={count}
                            onChange={() => {
                            }}
                            type="number"
                            max={maxCount}
                            min={1}
                        />
                    </div>
                    <div className="col text-start">
                        <Button
                            disabled={disabled || count === maxCount}
                            className="btn-secondary mint-button"
                            onClick={handleIncrement}
                        >
                            {' + '}
                        </Button>
                    </div>
                    <div className="col-12">
                        <b>{'Total: '}</b>{count * price}<b>{' '}{CHAIN.currency}</b>
                    </div>
                </>
            }
                <div className="col-12">
                    <Button
                        disabled={disabled || loading}
                        className="btn-success"
                        onClick={() => {
                            if (onMint) {
                                onMint({
                                    count,
                                    amount: count * price,
                                });
                            }
                        }}
                    >
                        {loading ? 'Minting...' : 'Mint'}
                    </Button>
                </div>
        </div>);
    }
;