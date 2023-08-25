import React, { useState, useEffect } from 'react';
import styles from './SellShares.module.css';
import { ethers } from 'ethers';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { Tooltip } from 'react-tooltip'




import { useExchangeRate } from '../helper/exRate';

import { useSharePrices } from '../helper/price';

const Sell = (props) => {

  const { contract, currentAccount, provider, signer } = props;

  const { getSharePrice } = useSharePrices();



  const [tokenAddress, setTokenAddress] = useState([]);

  const [sellAmount, setSellAmount] = useState('');


  const [tokenName, setTokenName] = useState('');
  const [tokens, setTokens] = useState({});





  const exchangeRate = useExchangeRate();

  const selectedFee = 500;








  const handleSellShares = async (event) => {
    event.preventDefault();

    if (contract) {
      try {

        const amount = ethers.utils.parseUnits((sellAmount * 100).toFixed(0), 0); // Convert to BigNumber with 0 decimal places
        const p = getTokenPrice(tokenName);
        const price = ethers.utils.parseUnits((Number(p) * 100).toFixed(0), 0); //
        const rate = exchangeRate;
        const decimals = 18; // Adjust the number of decimals based on your requirements
        const weiRate = ethers.utils.parseUnits(rate, decimals);

        console.log(amount.toString());
        console.log(price.toString());
        console.log(weiRate.toString());



        const tx = await contract.sellShares(
          amount.toString(),
          price.toString(),
          weiRate.toString(),
          tokens[tokenName],
          selectedFee
        );
        await tx.wait();

        console.log(`${getTokenName(tokens[tokenName])} sold`);

        toast.success(`${getTokenName(tokens[tokenName])} sold`, {
          position: toast.POSITION.TOP_CENTER
        });

        // notify(); // Show the toast notification for successful purchase
      } catch (error) {
        console.error('Failed to sell shares:', error);
        toast.error("Failed to sell shares", {
          position: toast.POSITION.TOP_CENTER
        });

      }
    }
  };


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

    // Get the token price, or set it to 0 if the value is not a valid number
    const price = parseFloat(tokenPrice[name]) || 0;

    return price;
  };



  useEffect(() => {
    const manuallyAddTokens = () => {
      const tokensToAdd = {
        TSLA: '0x7a1EaE6f4842a65A0a52e209B6bCFAAD814EdC40',
        AMZN: '0xfcBA7946047ac1FD16b3dDFE0C0d70BB2540DA24',
        GOOGL: '0x15b40DbEED47a3aA71BaFc00baa654964F8Fa2a5',
        MSFT: '0x7c358eF7dA72AA1c7CFa3B09bC3fCDA5Db6cF96B',
        AAPL: '0xa7CA0e5081CcD66937529Ed30eB7EE3725B1294f'
      };

      setTokens(tokensToAdd);
    };

    manuallyAddTokens();
  }, []);


  const handleTokenChange = (event) => {
    const name = event.target.value;
    setTokenName(name);

    if (tokens[name]) {
      setTokenAddress(tokens[name]);
    } else {
      setTokenAddress('');
    }
  };

  return (


    <div className={styles.container}>
      <div className={styles.buyShareSection}>
        <h2 className={styles.heading}>Sell Shares</h2>
        <form className="sell-shares-form" onSubmit={handleSellShares}>
          <div className={styles.sellAmount}>
            <input
              type="text"

              placeholder="Sell Amount"
              value={sellAmount}
              onChange={(e) => setSellAmount(e.target.value)}
              data-tooltip-id="tooltip" data-tooltip-content=" 5.00% selling fees "

            />
          </div>
          <div className={styles.selector}>

            <select
              className="token-select"
              value={tokenName}
              onChange={handleTokenChange}
              disabled={!Object.keys(tokens).length}
              data-tooltip-id="tooltip" data-tooltip-content="select shares"

            >
              <option value="">Select </option>
              {Object.keys(tokens).map((tokenSymbol) => (
                <option key={tokenSymbol} value={tokenSymbol}>
                  {tokenSymbol}
                </option>
              ))}
            </select>
          </div>





          <div className={styles.sellAmount}>
            <input
              type="number"
              className={styles.sellAmount}
              placeholder="Share Price"
              value={
                getTokenPrice(tokenName) === '' ? '' : getTokenPrice(tokenName).toFixed(2)

              }
              data-tooltip-id="tooltip" data-tooltip-content={` current ${(tokenName == "" ? "share" : tokenName)} price in USD`}

            />

          </div>

          <button className={styles.sellButton} type='submit'>
            Sell
          </button>
        </form>
      </div>


      <div className={styles.userSharesSection}>



      </div>


      <ToastContainer />
      <Tooltip
        style={{ backgroundColor: "black", color: "white", border: "1px solid black" }}
        id='tooltip'
      />


    </div>

  );
};
export default Sell;


