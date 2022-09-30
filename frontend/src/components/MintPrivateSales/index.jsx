import {Button} from "react-bootstrap";
import {useState} from "react";
import './styles.css'

export const MintPrivateSales = ({
                               onMint,
                               disabled,
                               loading,
                           }) => {

        const [amount, setAmount] = useState(0);

        const handleAmountChange = (e) => {
            const value = e.target.value;
            setAmount(Number(value));
        }
    
        return (<div className="row mt-3">
                
                <div>
                    <h2>
                        Minting Private Sales
                    </h2>
                </div>
                
                <div className="col-6 text-end fw-bold mt-3">
                        <span>amount: </span>
                        <input
                            value={amount}
                            onChange={handleAmountChange}
                            type="number"
                        />
                </div>

                <div className="col-6 text-start mt-3">
                    <Button
                        disabled={disabled || loading}
                        className="btn-success"
                        onClick={() => {
                            if (onMint) {
                                onMint({
                                    amount: amount,
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