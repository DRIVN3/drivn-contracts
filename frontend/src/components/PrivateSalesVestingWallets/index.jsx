import {useEffect, useState} from "react";
import { VestWallet } from "../VestWallet";

export const PrivateSalesVestingWallets = ({
                               onRelease,
                               getVestWallets,
                               disabled,
                               loading,
                           }) => {
        
        const [vestWallets, setWestWallets] = useState([]);
    
        useEffect(() => {            
            const vestWallets = async() => { 
                let data = await getVestWallets();
                setWestWallets(data);
            };
        
            vestWallets()
            .catch(console.error);
    
            }, [getVestWallets]);
                        
        return (<div className="row mt-3">
                
                <div>
                    <h2>
                        Your Private Vestings
                    </h2>
                </div>

                <VestWallet 
                vestWallets={vestWallets}
                onRelease={onRelease}
                disabled={disabled}
                loading={loading}
                />
            </div>);
    }
;