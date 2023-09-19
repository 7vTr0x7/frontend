

import React, { useState, useEffect } from 'react';
  import { ethers } from 'ethers';
  import "./App.css";
  import Buy from "./components/Buy";
  import Header from "./components/Header";
  import Sell from "./components/Sell";
  import Swap from "./components/Swap";
  import Tokens from "./components/Tokens";

  import { Routes, Route } from "react-router-dom";
  
  import { tokenizedShares,cpamm } from './utils/index';
  
  
  import BuyTable from "./components/BuyTable";
  
  function App() {
    const [isConnected, setIsConnected] = useState(false)
    const [OpenContract, setOpenContract] = useState(null);
    const [CpammContract, setCpammContract] = useState(null);
    const [provider, setProvider] = useState(undefined);
    const [signer, setSigner] = useState(undefined);
    const [cpammContractaddress, setCpammContractaddress] = useState('');
    const [currentAccount, setCurrentAccount] = useState('');
  

      // Connect to the Ethereum network
      const connectToEthereum = async () => {
        if (window.ethereum) {
          try {
            const account = await window.ethereum.request({
              method: 'eth_requestAccounts',
            });
  
            setCurrentAccount(account[0]);
  
            window.ethereum.on('chainChanged', () => {
              window.location.reload();
            });
  
            window.ethereum.on('accountsChanged', () => {
              window.location.reload();
            });
  
            // Create an ethers.js provider
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
  
            const contractAddress = '0xc9a0ABeB48edAFcdb743c5B28d8E4996dbdC0207';
  
            // Create a new ethers.js contract instance
            const contract = new ethers.Contract(
              contractAddress,
              tokenizedShares.abi,
              signer
            );

            const cpammContract = new ethers.Contract(
              "0xC22b094a471D9DC2Ff2EbE050A56A1d6a25cf4CA",
              cpamm.abi,
              signer
            );

            setCpammContractaddress('0xC22b094a471D9DC2Ff2EbE050A56A1d6a25cf4CA')

            setCpammContract(cpammContract);
  
            // Set the contract instance in state
            setOpenContract(contract);
            setProvider(provider);
            setSigner(signer);
            setIsConnected(true);
           
          } catch (error) {
            console.error(error);
          }
        } else {
          console.error('Ethereum not found');
        }
      };
  
   


    useEffect(() => {
      connectToEthereum();
    }, []);
  
  
  
    return (

      <div className="App">
        <Header connectToEthereum={connectToEthereum} isConnected={isConnected} currentAccount={currentAccount} />
        <div className="mainWindow">
          <Routes>
            <Route path="/" element={<Swap isConnected={isConnected} OpenContract={OpenContract} contractaddress={cpammContractaddress} contract = {CpammContract} currentAccount = {currentAccount} provider={provider} signer = {signer} />} />
            <Route path="/tokens" element={<Tokens  isConnected={isConnected} />} />
            <Route path="/buy" element={<Buy isConnected={isConnected} contract = {OpenContract} currentAccount = {currentAccount} provider={provider} signer = {signer} />} />
            <Route path="/sell" element={<Sell isConnected={isConnected} contract = {OpenContract} currentAccount = {currentAccount} provider={provider} signer = {signer} />} />
            {/* <Route path="/stocks" element={<Stocks isConnected={isConnected} address={address} />} /> */}
            <Route path="/history" element={<BuyTable isConnected={isConnected}  contract = {OpenContract} CpammContract = {CpammContract}   currentAccount = {currentAccount} provider={provider} signer = {signer}/>} />
            
          </Routes>
        </div>
  
      </div>
    )
  }
  
  export default App;
  