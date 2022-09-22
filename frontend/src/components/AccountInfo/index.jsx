import {displayAddress} from "../../utils";
import {Button} from "react-bootstrap";
import {CHAIN} from "../../constants";
import {useState} from "react";

export const AccountInfo = ({account, setErrorMessage}) => {
    const [copied, setCopied] = useState(false);

    const handleCopyAddress = async () => {
        if (copied) {
            return
        }

        try {
            await navigator.clipboard.writeText(account.address);
            setCopied(true);
            setTimeout(() => {
                setCopied(false);
            }, 2000);
        } catch (e) {
            setErrorMessage("Something went wrong. Couldn't copy account address.");
        }
    }

    return <div className="row">
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
                        className={copied ? "btn-sm btn-success mx-1" : "btn-sm btn-secondary mx-1"}
                    >
                        {copied ? "Copied" : "Copy"}
                    </Button>
                </div>
                <div className="col-6 text-end fw-bold">Balance:</div>
                <div className="col-6 text-start">
                    {account.balance}{' '}<b>{CHAIN.currency}</b>
                </div>
            </> : <div className="col-12">Account not connected</div>
        }
    </div>
};