import React from "react";

import { Link } from "react-router-dom";

import "./Header.css"
import openLogo from "../OpenAppBull.png"

function Header(props) {

  const {currentAccount, isConnected, connectToEthereum ,disconnectFromEthereum} = props;

  return (
    <header>
      <div className="leftH">
        <img src={openLogo} alt="logo" className="logo"  />
        <Link to="/buy" className="link">
          <div className="headerItem">Buy</div>
        </Link>  
         <Link to="/sell" className="link">
          <div className="headerItem">Sell</div>
        </Link> 
        <Link to="/" className="link">
          <div className="headerItem">Swap</div>
        </Link>
        <Link to="/history" className="link">
          <div className="headerItem">Account</div>
        </Link>  
        {/* <Link to="/stocks" className="link">
          <div className="headerItem">Stocks</div>
        </Link>  */}
      </div>
      <div className="rightH">
        {/* <div className="headerItem">
          <img src={Eth} alt="eth" className="eth" />
          Ethereum
        </div> */}
        <div>
          {isConnected ? (
            <button className="disConnectButton" onClick={disconnectFromEthereum} > Disconnect </button>
          ) : (
            <button className="connectButton" onClick={connectToEthereum}> Connect </button>
          ) }
        </div>
      </div>
    </header>
  );
}

export default Header;