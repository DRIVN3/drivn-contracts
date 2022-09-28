import {
    Generate,
    Main,
    PrivateSales
} from "./components";
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
    return <Router>
        <div>
          <Routes>
              <Route path='/' element={<Main/>} />
              <Route path='/nft-generate' element={<Generate/>} />
              <Route path='/private-sales' element={<PrivateSales/>} />
          </Routes>
        </div>
      </Router>
}

export default App;
