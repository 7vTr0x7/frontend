import { useState, useEffect } from 'react';
import axios from 'axios';

const useExchangeRate = () => {
  const [exchangeRate, setExchangeRate] = useState(null);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=usd-coin,matic-network&vs_currencies=usd');
        const usdPrice = response.data['usd-coin'].usd;
        const maticPrice = response.data['matic-network'].usd;

        const rate = usdPrice / maticPrice;
        setExchangeRate(rate.toFixed(2)); // Adjust the decimal places as needed
      } catch (error) {
        console.log('Error fetching data:', error);
      }
    };

    fetchPrices();
  }, []);

  return exchangeRate;
};

export { useExchangeRate }; // Export the hook function useExchangeRate
