import {getTokenFullName} from "../../utils";

export const Tokens = ({tokens = []}) => {
    return <div className="row w-100">
        <div className="col-3"/>
        <div className="col-6 text-start">
            {
                tokens.map((token) => {
                    return <p key={token.tokenId}>{getTokenFullName(token)}</p>
                })
            }
        </div>
        <div className="col-3"/>
    </div>;
};