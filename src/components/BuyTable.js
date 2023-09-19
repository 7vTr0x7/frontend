import React, { useState, useEffect } from 'react';
import styles from './BuyTable.module.css';
import { ethers } from 'ethers';
import { useExchangeRate } from "../helper/exRate";
import { useSharePrices } from '../helper/price';

const BuyTable = (props) => {
  const { contract, currentAccount, CpammContract } = props;
  const { getSharePrice } = useSharePrices();
  const exchangeRate = useExchangeRate();

  const [userShares, setUserShares] = useState([]);


  const currentAddress = currentAccount.toString()

  useEffect(() => {
    const getUserShares = async () => {
      if (contract && currentAccount) {
        try {
          const shares = await contract.getUserShares(currentAccount);
          setUserShares(shares);
        } catch (error) {
          console.error('Failed to get user shares:', error);
        }
      }
    };



    getUserShares();

  }, [contract, currentAccount, currentAddress]);

  const getTokenName = (address) => {
    // Replace this with your actual implementation to fetch the token name from your data source
    const tokenNames = {
      '0x7a1EaE6f4842a65A0a52e209B6bCFAAD814EdC40': 'TSLA',
      '0xfcBA7946047ac1FD16b3dDFE0C0d70BB2540DA24': 'AMZN',
      '0x15b40DbEED47a3aA71BaFc00baa654964F8Fa2a5': 'GOOGL',
      '0x7c358eF7dA72AA1c7CFa3B09bC3fCDA5Db6cF96B': 'MSFT',
      '0xa7CA0e5081CcD66937529Ed30eB7EE3725B1294f': 'AAPL'
    };

    return tokenNames[address] || 'Unknown';
  };

  const getTokenPrice = (name) => {
    // Replace this with your actual implementation to fetch the token name from your data source
    const tokenPrice = {
      TSLA: getSharePrice("TSLA"),
      AMZN: getSharePrice("AMZN"),
      GOOGL: getSharePrice('GOOGL'),
      MSFT: getSharePrice('MSFT'),
      AAPL: getSharePrice("AAPL"),
    };

    const price = parseFloat(tokenPrice[name]) || 0;

    return price;
  };

  return (
    <div className={styles['user-shares']}>
      {(
        userShares.length > 0 ?
          <table className={styles['shares-table']}>
            <thead>
              <tr>
                <th>Name</th>
                <th>USD</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>P/L</th>
                <th>Matic</th>
              </tr>
            </thead>
            <tbody>
              {userShares.map((share, index) => (
                <tr key={index}>
                  <td>{getTokenName(share.tokenAddress)}</td>
                  <td>
                    {Math.floor(((getTokenPrice(getTokenName(share.tokenAddress))) * (share.buyAmount.toString() / 100) / (share.buyPrice.toString() / 100)) * 100) / 100}
                  </td>
                  <td>{(getTokenPrice(getTokenName(share.tokenAddress))).toFixed(2)}</td>
                  <td>{Number((ethers.utils.formatEther(share.tokenAmt))).toFixed(5)}</td>
                  <td className={(Math.floor(
                    ((getTokenPrice(getTokenName(share.tokenAddress)) *
                      (share.buyAmount.toString() / 100) /
                      (share.buyPrice.toString() / 100)) -
                      (share.buyAmount.toString() / 100)) *
                    100
                  ) / 100) >= 0 ? styles['profit-positive'] : styles['profit-negative']}>
                    {Math.floor((((getTokenPrice(getTokenName(share.tokenAddress))) * (share.buyAmount.toString() / 100) / (share.buyPrice.toString() / 100)) - (share.buyAmount.toString() / 100)) * 100) / 100}{' '}
                    
                    {(((getTokenPrice(getTokenName(share.tokenAddress))) * (share.buyAmount.toString() / 100) / (share.buyPrice.toString() / 100) - (share.buyAmount.toString() / 100)).toFixed(2) >= 0 ? '▲' : '▼')}
                    {(((getTokenPrice(getTokenName(share.tokenAddress))) * (share.buyAmount.toString() / 100) / (share.buyPrice.toString() / 100) - (share.buyAmount.toString() / 100)) / (share.buyAmount.toString() / 100) * 100).toFixed(2)}%
                  </td>
                  <td>
                    {Math.floor((((getTokenPrice(getTokenName(share.tokenAddress))) * (share.buyAmount.toString() / 100) / (share.buyPrice.toString() / 100)) * exchangeRate) * 1000) / 1000}
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
          : <p className={styles['text']}>Dont Have Any Holdings</p>
      )}

    </div>
  );
};

export default BuyTable;
