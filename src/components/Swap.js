import React, { useState, useEffect,useCallback } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { Tooltip } from 'react-tooltip'


import { useSharePrices } from '../helper/price';
import { useExchangeRate } from "../helper/exRate";

import styles from "./Swap.module.css"; // Import the CSS module

import { ethers } from "ethers";

import {
  tesla,

  amazon,
  google,
  microsoft,
  apple,
} from "../utils/index";

function Swap(props) {
  //states from open investment

 
  const { OpenContract,contractaddress,contract,currentAccount ,provider, signer } = props;

  const exchangeRate = useExchangeRate();


  const { getSharePrice } = useSharePrices();

  const [tokens, setTokens] = useState({});
  const [reserves, setReserves] = useState({});

  const [token1Name, setToken1Name] = useState("");
  const [token2Name, setToken2Name] = useState("");

  const [amountIn, setAmountIn] = useState("");
  const [amountOut, setAmountOut] = useState("");
  const [token1Address, setToken1Address] = useState("");
  const [token2Address, setToken2Address] = useState("");
  const [token1Balance, setToken1Balance] = useState(null);
  const [token2Balance, setToken2Balance] = useState(null);

  const [tokenInAmt, setTokenInAmt] = useState('');



  const [tokenABIs, setTokenABIs] = useState({});


  useEffect(() => {
    setTokenABIs({
      TSLA: tesla,
      AMZN: amazon,
      GOOGL: google,
      MSFT: microsoft,
      AAPL: apple,
    });
  }, []);

  const [userShares, setUserShares] = useState([]);


  const selectedFee = 200;


  const getUserShares = async () => {
    if (contract && currentAccount) {
      try {
        const shares = await OpenContract.getUserShares(currentAccount);
        setUserShares(shares);
      } catch (error) {
        console.error('Failed to get user shares:', error);
      }
    }
  };

  useEffect(() => {
    getUserShares()
  })
  

  // Fetch token reserves and total supply
  useEffect(() => {
    const fetchTokenData = async () => {
      try {
        if (contract && token1Name && token2Name) {
          const token1Addr = tokens[token1Name];
          const token2Addr = tokens[token2Name];

          setToken1Address(token1Addr);
          setToken2Address(token2Addr);

          const reserve1 = await contract.reserves(token1Addr);
          const reserve2 = await contract.reserves(token2Addr);
          setReserves({
            ...reserves,
            [token1Addr]: reserve1,
            [token2Addr]: reserve2,
          });
        }
      } catch (error) {
        console.error("Error fetching token data:", error);
      }
    };

    fetchTokenData();
  }, [contract, tokens, token1Name, token2Name]);

  // Handle token selection
  const handleTokenInChange = (event) => {
    const name = event.target.value;
    setToken1Name(name);
    if (tokens[name]) {
      setToken1Address(tokens[name]);
    } else {
      setToken1Address("");
    }
  };

  const handleTokenOutChange = (event) => {
    const name = event.target.value;
    setToken2Name(name);
    if (tokens[name]) {
      setToken2Address(tokens[name]);
    } else {
      setToken2Address("");
    }
  };

  // Handle input changes


  const handleAmountInChange = (event) => {
    setAmountIn(event.target.value);
  };



  // Handle token swap
  const handleSwap = async (event) => {
    event.preventDefault();

    try {
      if (!contract) {
        console.error("Contract is not initialized");
        return;
      }

      const tokenInAddress = tokens[token1Name];
      const tokenOutAddress = tokens[token2Name];

      if (!tokenInAddress || !tokenOutAddress) {
        console.error("Invalid token addresses");
        return;
      }


      const t1 = getTokenPrice(token1Name)
      const t2 = getTokenPrice(token2Name)

      const token1P = ethers.utils.parseUnits((Number(t1) * 100).toFixed(0), 0)
      const token2P = ethers.utils.parseUnits((Number(t2) * 100).toFixed(0), 0); // Convert to BigNumber with 0 decimal places

      console.log(token1P.toString())
      console.log(token2P.toString())

      const unit2 = ethers.utils.parseUnits((amountIn * 100).toFixed(0), 0); // Convert to BigNumber with 0 decimal places
  
      const amtIn = unit2.toString();

      console.log(amtIn.toString());

      let buyPrice;

      for(let i = 0;i < userShares.length; i ++){
       {userShares.map((share) => (
           (share.tokenAddress == tokenInAddress ? buyPrice = share.buyPrice : buyPrice = 0 )
       ))}
      }

      console.log(buyPrice.toString() / 100)

      let tokenAmtIn = await OpenContract.get(amtIn,buyPrice);


      const token1Contract = new ethers.Contract(
        tokens[token1Name],
        tokenABIs[token1Name].abi,
        signer
      );


      
      const rate = exchangeRate;
      const decimals = 18; // Adjust the number of decimals based on your requirements
      const weiRate = ethers.utils.parseUnits(rate, decimals);
      console.log(weiRate.toString());

  
      

      const appro1 = await token1Contract.approve(contractaddress, tokenAmtIn);
      await appro1.wait();
      console.log(`${getTokenName(tokens[token1Name])} approved`);
      toast.success(`${getTokenName(tokens[token1Name])} approved`, {
        position: toast.POSITION.TOP_CENTER
      });

      const swap = await contract.swap(
        token1Address,
        amtIn,
        token2Address,
        token1P,
        token2P,
        weiRate,
        selectedFee
      );

      await swap.wait();
      console.log("swaped successfully");

      toast.success(`${getTokenName(tokens[token1Name])} swaped`, {
        position: toast.POSITION.TOP_CENTER
      });
    } catch (error) {
      console.error("Error swapping tokens:", error);
      toast.error("Failed to swap shares", {
        position: toast.POSITION.TOP_CENTER
      });


    }
  };


  // const init = useCallback( async () => {
  //   if (amountIn > 0){

  //     const tokenIn = tokens[token1Name];
  //     const amtIn =  ethers.utils.parseUnits((amountIn * 100).toFixed(0), 0); // Convert to BigNumber with 0 decimal places
 
  //     let tokenAmtIn;
 
  //     let amountOut;
 
  //     [tokenAmtIn, amountOut] = await contract.get(tokenIn, amtIn);

  //     const amtOut = amountOut / 100;
      
  //          setAmountOut(amtOut.toString());

 
  //    }
   
  // }, [amountIn,amountOut]);

  // useEffect(() => {
  //   init();
  // }, [init]);




  // Fetch token balances and shares
  const fetchBalancesAndShares = async () => {
    try {
      if (!contract) {
        console.error("Contract is not initialized");
        return;
      }

      const token1Address = tokens[token1Name];
      const token2Address = tokens[token2Name];

      if (!token1Address || !token2Address) {
        console.error("Invalid token addresses");
        return;
      }

      // Fetch token balances

      const token1Contract = new ethers.Contract(
        tokens[token1Name],
        tokenABIs[token1Name].abi,
        signer
      );
      const token2Contract = new ethers.Contract(
        tokens[token2Name],
        tokenABIs[token2Name].abi,
        signer
      );

      // const token1 = await token1Contract.tokens(token1Address);
      // const token2 = await token2Contract.tokens(token2Address);

      const token1Balance = await token1Contract.balanceOf(currentAccount);
      const token2Balance = await token2Contract.balanceOf(currentAccount);
      setToken1Balance(ethers.utils.formatEther(token1Balance));
      setToken2Balance(ethers.utils.formatEther(token2Balance));
    } catch (error) {
      console.error("Error fetching token balances and shares:", error);
    }
  };

  // Fetch token balances and shares when contract, tokens, or currentAccount change
  useEffect(() => {
    fetchBalancesAndShares();
  }, [contract, tokens, currentAccount]);

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
    <div className={styles["swap-container"]}>
      <h2 className={styles["swap-heading"]}>Swap Shares</h2>

      <div className={styles["swap-input-group"]}>
        <input
          className={styles.inputGroup}
          type="number"
          id="amount-in"
          placeholder="Amount IN"
          value={amountIn}
          onChange={handleAmountInChange}
          data-tooltip-id="tooltip" data-tooltip-content="USD Amount"

        />
        <select
          className={styles.select}
          id="token-in"
          value={token1Name}
          onChange={handleTokenInChange}
          data-tooltip-id="tooltip" data-tooltip-content="select share"

        >
          <option value="">Select</option>
          {Object.keys(tokens).map((tokenSymbol) => (
            <option key={tokenSymbol} value={tokenSymbol}>
              {tokenSymbol}
            </option>
          ))}
        </select>
      </div>

      <div className={styles["swap-input-group"]}>
        <input
          className={styles.inputGroup}
          type="number"
          id="amount-out"
          placeholder="Amount OUT"
          value={( (amountIn * (10000 - selectedFee)) / 10000 == 0 ? "Amount OUT" : (amountIn * (10000 - selectedFee)) / 10000 )}
          data-tooltip-id="tooltip" data-tooltip-content={ ` charging 2.00% swap fees ` }

        />
        <select
          className={styles.select}
          id="token-out"
          value={token2Name}
          onChange={handleTokenOutChange}
          data-tooltip-id="tooltip" data-tooltip-content="select share"

        >
          <option value="">Select</option>
          {Object.keys(tokens).map((tokenSymbol) => (
            <option key={tokenSymbol} value={tokenSymbol}>
              {tokenSymbol}
            </option>
          ))}
        </select>
      </div>

      <div className={styles["swap-output-group"]}>
        <p>
          {token1Name} = {(getTokenPrice(token1Name) / getTokenPrice(token2Name)).toFixed(2)} {token2Name}
        </p>
      </div>

      <div className={styles["swap-button-group"]}>
        <button className={styles["swap-button"]} onClick={handleSwap}>
          Swap
        </button>
      </div>

      




      <ToastContainer />
      <Tooltip 
         style={{ backgroundColor: "black", color: "white" , border: "1px solid black" }}
        id='tooltip'
      />

    </div>
    
  );
}



export default Swap;