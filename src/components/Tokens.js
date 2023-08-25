import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "./Tokens.module.css"


const TDKEY = 'f9dc2d5724764a2488455e8c9a8b060c';
const tickers = ['AMZN', 'AAPL', 'TSLA', 'GOOGL', 'MSFT', 'NVR'];

const fetchSharePrices = async () => {
  try {
    const tdurl = `https://api.twelvedata.com/price?symbol=${tickers.join(',')}&apikey=${TDKEY}`;

    const response = await axios.get(tdurl);
    const data = response.data;

    const formattedData = {};

    if (tickers.length === 1) {
      const key = tickers[0];
      formattedData[key] = parseFloat(data.price);
    } else if (tickers.length > 1) {
      for (let key in data) {
        formattedData[key] = parseFloat(data[key].price);
      }
    }

    return formattedData;
  } catch (error) {
    console.error('Error fetching real-time shares data:', error);
    return null;
  }
};

const StockExchange = () => {
  const [sharesData, setSharesData] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      const sharePrices = await fetchSharePrices();
      if (sharePrices) {
        setSharesData(sharePrices);
      }
    };

    fetchData();

    const interval = setInterval(fetchData, 60000);

    return () => clearInterval(interval);
  }, []);

  const getSharePrice = (ticker) => {
    if (sharesData.hasOwnProperty(ticker)) {
      return sharesData[ticker];
    }
    return null;
  };

  



  return (
    <div className="stock-exchange-container">
      <h1 className="stock-exchange-title">Real-Time Stock Exchange</h1>
      <div className="stock-list">
        {tickers.map((ticker) => (
          <div key={ticker} className="stock-item">
            <p className="ticker">{ticker}</p>
            <p className="price">${getSharePrice(ticker)}</p>
            {/* <p className="price">${ticker.values[]}</p> */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StockExchange;
