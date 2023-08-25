import React, { useState, useEffect } from 'react';
import styles from './BuyShare.module.css';
import { ethers } from 'ethers';
import { useExchangeRate } from "../helper/exRate";


import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSharePrices } from '../helper/price';

import { Tooltip } from 'react-tooltip'


const Buy = (props) => {


  const { contract, currentAccount, provider, signer } = props;

  const { getSharePrice } = useSharePrices();


  const [tokenAddress, setTokenAddress] = useState([]);
  const [buyAmount, setBuyAmount] = useState('');


  const [tokenName, setTokenName] = useState('');
  const [tokens, setTokens] = useState({});





  const [requiredEthValue, setRequiredEthValue] = useState('');


  const exchangeRate = useExchangeRate();
  console.log(exchangeRate)






  useEffect(() => {
    const fetchRequiredEth = async () => {
      if (contract && buyAmount && exchangeRate) {
        try {
          const amount = ethers.utils.parseUnits((buyAmount * 100).toFixed(0), 0); // Convert to BigNumber with 0 decimal places
          const rate = exchangeRate;
          const decimals = 18; // Adjust the number of decimals based on your requirements
          const weiRate = ethers.utils.parseUnits(rate, decimals);
          console.log(weiRate.toString());

          const requiredEthAmount = await contract.requiredEth(amount, weiRate);
          setRequiredEthValue(requiredEthAmount.toString());
        } catch (error) {
          console.error('Failed to fetch required ETH:', error);
        }
      }
    };

    fetchRequiredEth();
  }, [contract, buyAmount, exchangeRate]);


  const handleBuyShares = async (event) => {
    event.preventDefault();
    if (contract && buyAmount && exchangeRate) {
      try {
        const amount = ethers.utils.parseUnits((buyAmount * 100).toFixed(0), 0); // Convert to BigNumber with 0 decimal places
        const p = getTokenPrice(tokenName);
        const price = ethers.utils.parseUnits((Number(p) * 100).toFixed(0), 0); // Convert to BigNumber with 0 decimal places

        console.log(price.toString());
        console.log(amount.toString());


        const rate = exchangeRate;
        const decimals = 18; // Adjust the number of decimals based on your requirements
        const weiRate = ethers.utils.parseUnits(rate, decimals);
        console.log(weiRate.toString());

        const ethValue = requiredEthValue;


        const transaction = await contract
          .connect(signer)
          .buyShares(amount, price, weiRate, tokens[tokenName], { value: ethValue });
        await transaction.wait();

  
        console.log(`${getTokenName(tokens[tokenName])} bought`);
    
        toast.success(`${getTokenName(tokens[tokenName])} bought`, {
          position: toast.POSITION.TOP_CENTER
        });
        // notify(); // Show the toast notification for successful purchase
      } catch (error) {
        console.error('Failed to buy shares:', error);
        toast.error("Error", {
          position: toast.POSITION.TOP_CENTER
        });
  // Show the toast notification for the failure
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
  return (
    <div className={styles.container}>
    


      <div className={styles.buyShareSection}>
        <h2 className={styles.heading}>Buy Share</h2>
        <form className={styles['buy-shares-form']} onSubmit={handleBuyShares}>

          <div className= {styles.content}>

          </div>
         
          <div className={styles.buyAmount} >
          
            <input
              type="text"
              id="buyAmount"
              placeholder="USD Amount : "
              value={buyAmount}
              onChange={(e) => setBuyAmount(e.target.value)}
              data-tooltip-id="tooltip" data-tooltip-content=" USD Amount : "
            />
          </div>
         {/* <p className= {styles.i} >i</p> */}


          <div className={styles.selector}>
            <select
              className={styles['token-select']}
              value={tokenName}
              onChange={handleTokenChange}
              disabled={!Object.keys(tokens).length}
              data-tooltip-id="tooltip" data-tooltip-content="Share Selection :"

            >
              <option value="">Select</option>
              {Object.keys(tokens).map((tokenSymbol) => (
                <option key={tokenSymbol} value={tokenSymbol}>
                  {tokenSymbol}
                </option>
              ))}
            </select>
          </div>


      
          <input
            type="number"
            className={styles.sellAmount}
            placeholder="Share Price"
            value={
              getTokenPrice(tokenName) === '' ? '' : getTokenPrice(tokenName).toFixed(2)
              
            }
            data-tooltip-id="tooltip" data-tooltip-content={` Live  ${( tokenName == "" ?   "Share" : tokenName  )} Price :`}
          />




          <input
            type="number"
            className={styles.sellAmount}
            placeholder="required"
            value={
              requiredEthValue === ''
                ? ''
                : ethers.utils.formatEther(requiredEthValue.toString())
            }
            // data-tooltip-id="tooltip" data-tooltip-content={` required matic as per exchange rate 1 USD = ${exchangeRate} matic `}
            data-tooltip-id="tooltip" data-tooltip-content={` Matic Required :`}
          />

          <button className={styles.buyButton} type="submit">
            Buy
          </button>
        </form>
      </div>

      <div>

      </div>
      <ToastContainer />
      <Tooltip 
         style={{ backgroundColor: "black", color: "white" , border: "1px solid black" }}
        id='tooltip'
      />


    </div>
  );

};

export default Buy;
