import { useState, useEffect } from 'react';
import axios from 'axios';

const apiKey = 'pk_c483283f3f9d48d5b8bf7eee96072cb7'; // Replace with your IEX Cloud API key
const tickers = ['AMZN', 'AAPL', 'TSLA', 'GOOGL', 'MSFT'];

export const useSharePrices = () => {
  const [sharesData, setSharesData] = useState({});
  
  useEffect(() => {
    const fetchData = async () => {
      const sharePrices = await fetchSharePrices();
      if (sharePrices) {
        setSharesData(sharePrices);
        console.log('Fetched share prices:', sharePrices);
      }
    };

    fetchData();

    const updateInterval = setInterval(fetchData, 60000); // Update every 1 minute

    // Clean up the interval when the component is unmounted
    return () => clearInterval(updateInterval);
  }, []);

  const fetchSharePrices = async () => {
    try {
      const sharePrices = await Promise.all(tickers.map(fetchSharePrice));

      const formattedData = {};
      sharePrices.forEach(priceData => {
        formattedData[priceData.ticker] = parseFloat(priceData.price);
      });

      return formattedData;
    } catch (error) {
      console.error('Error fetching real-time shares data:', error);
      return null;
    }
  };

  const fetchSharePrice = async (ticker) => {
    try {
      const url = `https://cloud.iexapis.com/stable/stock/${ticker}/quote?token=${apiKey}`;
      const response = await axios.get(url);
      const data = response.data;

      const latestPrice = data.latestPrice;

      return { ticker, price: latestPrice.toString() };
    } catch (error) {
      console.error(`Error fetching data for ${ticker}:`, error);
      return { ticker, price: 'N/A' };
    }
  };

  const getSharePrice = (ticker) => {
    if (sharesData.hasOwnProperty(ticker)) {
      return sharesData[ticker];
    }
    return null;
  };

  return {
    getSharePrice,
  };
};
