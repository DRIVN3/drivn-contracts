import { Link } from 'react-router-dom';

export const Main = () => {
    return <div>
            <h2>Welcome Drivn Demo</h2>
            <nav className="navbar navbar-expand-lg navbar-light bg-light">
            <ul className="navbar-nav mr-auto">
            <li><Link to={'/nft-generate'} className="nav-link">GTT generation Demo</Link></li>
            <li><Link to={'/private-sales'} className="nav-link">Private sales Demo</Link></li>
            </ul>
            </nav>
            <hr />
        </div>
};