import {Button} from "react-bootstrap";
import {useEffect, useState} from "react";
import {getTokenFullName} from "../../utils";

export const MergeNFTs = ({
                              allTokens,
                              loading,
                              onMerge,
                          }) => {
    const [token1Options] = useState([...allTokens]);
    const [token1, setToken1] = useState(allTokens[0]?.tokenId || null);

    const [token2Options, setToken2Options] = useState([]);
    const [token2, setToken2] = useState(null);

    useEffect(() => {
        if (token1 !== null) {
            const token1Metadata = allTokens.find((t) => t.tokenId === token1);
            const options2 = [...allTokens].filter((t) => t.tokenId !== token1 && t.vehicleType.type === token1Metadata.vehicleType.type);
            setToken2Options(options2);
            if (options2.length) {
                setToken2(options2[0].tokenId);
            }
        } else {
            setToken2Options([]);
        }
    }, [token1, allTokens]);

    const handleToken1Selection = (e) => {
        const value = e.target.value;
        setToken1(Number(value));
    }

    const handleToken2Selection = (e) => {
        const value = e.target.value;
        setToken2(Number(value));
    }

    if (allTokens.length === 0) {
        return null;
    }

    return (<>
        <div className="row w-100 p-3">
            <div className="col-6 text-end fw-bold">
                <span>Token 1: </span>
                {
                    token1Options.length > 0 && <select
                        className="token-dropdown"
                        value={token1}
                        onChange={handleToken1Selection}
                    >
                        {
                            token1Options.map((option) => {
                                return <option
                                    key={option.tokenId}
                                    className="token-item"
                                    value={option.tokenId}
                                >
                                    {getTokenFullName(option)}
                                </option>
                            })
                        }
                    </select>
                }
            </div>
            <div className="col-6 text-start fw-bold">
                <span>Token 2: </span>
                {
                    token2Options.length > 0 && <select
                        className="token-dropdown"
                        value={token2}
                        onChange={handleToken2Selection}
                    >
                        {
                            token2Options.map((option) => {
                                return <option
                                    key={option.tokenId}
                                    className="token-item"
                                    value={option.tokenId}
                                >
                                    {getTokenFullName(option)}
                                </option>
                            })
                        }
                    </select>
                }
            </div>
        </div>
        <div className="row w-100">
            <div className="col-12">
                <Button
                    disabled={!token1 || !token2 || loading}
                    className="btn-success"
                    onClick={() => {
                        if (onMerge) {
                            onMerge(token1, token2);
                        }
                    }}
                >
                    {loading ? 'Merging...' : 'Merge'}
                </Button>
            </div>
        </div>
    </>);
};