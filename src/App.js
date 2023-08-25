

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
  
            const contractAddress = '0x5c256d407EAC0e82A717021d6782Ca4C7C0d5840';
  
            // Create a new ethers.js contract instance
            const contract = new ethers.Contract(
              contractAddress,
              tokenizedShares.abi,
              signer
            );

            const cpammContract = new ethers.Contract(
              "0xdc3781a469464cE4efb87A1708C0292B9a49b936",
              cpamm.abi,
              signer
            );

            setCpammContractaddress('0xdc3781a469464cE4efb87A1708C0292B9a49b936')

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
  