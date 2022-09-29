import { Button, Card, Col, Row, Stack } from 'react-bootstrap';

import Address from '../Address';

export const VestWallet = ({
    vestWallets = [], 
    onRelease,
    disabled,
    loading,
}) => {
    
    function getDate(timeStamp) {
        var date = new Date(timeStamp * 1000);
        return date.toDateString();
    }


    return <Row className="g-2">
        {vestWallets.map((vestWallet) => (
            <Col xl={12} key={vestWallet.contractAddress}>
                <Card>
                    <Card.Body>
                        <Stack gap={2}>
                        <div>
                            <b>Contract Address: </b>
                            <Address value={vestWallet.contractAddress} />
                        </div>
                        <div>
                            <b>Beneficiary Address: </b>
                            <Address value={vestWallet.beneficiary} />
                        </div>
                        <div>
                            <b>Release Start Date: </b>
                            {getDate(vestWallet.start)}
                        </div>
                        <div>
                            <b>Contract Balance: </b>
                            {vestWallet.balance / Math.pow(10, 18)}
                        </div>
                        <div>
                            <Button 
                                className="" 
                                variant="primary" 
                                onClick={
                                    () => {
                                        onRelease(vestWallet.contractAddress)
                                    }
                                }
                                disabled={disabled || loading}
                            >
                                {loading ? 'Releasing...' : 'Release'}
                            </Button>
                        </div>
                        </Stack>
                    </Card.Body>
                </Card>
            </Col>
        ))}
    </Row>

};