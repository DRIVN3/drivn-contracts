import {Button} from "react-bootstrap";

export const ConnectButton = ({isConnected, loading, onConnect}) => {
    return <div className="row">
        {
            (!isConnected || loading) && <div className="col-12 mt-3">
                <Button
                    disabled={!!isConnected || loading}
                    className={(isConnected || loading) ? "btn-secondary" : "btn-success"}
                    onClick={() => {
                        onConnect();
                    }}
                >
                    {loading ? 'Connecting...' : 'Connect to Wallet'}
                </Button>
            </div>
        }
    </div>;
};