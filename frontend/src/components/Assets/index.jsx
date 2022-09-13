export const Assets = ({ assetName, assetValue }) => {
    return <div className="row w-100 mt-1">
        <div className="col-6 text-end fw-bold">
            <h5>{assetName}:</h5>
        </div>
        <div className="col-6 text-start">
            <h5>{assetValue}</h5>
        </div>
    </div>;
};