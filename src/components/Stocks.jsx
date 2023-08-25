import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Styles from './Stocks.module.css';


const TDKEY = 'b1d06fe4e6f64762ab9303a84f9947f5';
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
    <div className={Styles.stock_exchange_container}>
      <h1 className={Styles.stock_exchange_title}>Real-Time Stock Exchange</h1>
      <div className={Styles.stock_list}>
  {tickers.map((ticker) => (
    <div key={ticker} className={Styles.stock_item}>
      <p className={Styles.ticker}>{ticker}</p>
      <p className={Styles.price}>
        ${getSharePrice(ticker) !== null ? getSharePrice(ticker).toFixed(2) : 'N/A'}
      </p>
    </div>
  ))}
</div>

    </div>
  );
};

export default StockExchange;
