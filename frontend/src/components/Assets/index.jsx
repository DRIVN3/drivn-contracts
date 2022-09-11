export const Assets = ({ assetName, assetValue }) => {
    return <div className="row w-100">
        <div className="col-6 text-end fw-bold">
            {assetName}:
        </div>
        <div className="col-6 text-start">
            {assetValue || 'N/A'}
        </div>
    </div>;
};