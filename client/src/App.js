import React, { useState } from 'react';
import { ethers } from 'ethers'; 
import './App.css'; 

// Import ABI files
const walletFactoryAbi = require('./abis/walletFactory.json');
const smartWalletAbi = require('./abis/smartWallet.json');

// Factory Contract addresses
const walletFactoryAddress = '0xD2674C261c7A900bf5228E2719bea73F186068ed';

function App() {
  const [provider, setProvider] = useState(null);
  const [walletFactoryContract, setWalletFactoryContract] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);
  const [smartWalletContract, setSmartWalletContract] = useState(null);
  const [balance, setBalance] = useState(0);
  const [transferToContractResult, setTransferToContractResult] = useState('');
  const [transferResult, setTransferResult] = useState('');
  const [contractAddressInput, setContractAddressInput] = useState('');
  const [amountInput, setAmountInput] = useState('');

  const connectToEthereum = async () => {
    if (window.ethereum) {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      const walletFactory = new ethers.Contract(walletFactoryAddress, walletFactoryAbi, signer);
      setWalletFactoryContract(walletFactory);

      const myWalletAddress = await walletFactory.getMyWallet();
      if (myWalletAddress !== ethers.constants.AddressZero) {
        setWalletAddress(myWalletAddress);

        const smartWallet = new ethers.Contract(myWalletAddress, smartWalletAbi, signer);
        setSmartWalletContract(smartWallet);
      }

      setProvider(provider);
    } else {
      console.log('Please install MetaMask...............................');
    }
  };

  const createWallet = async () => {
    try {
      const tx = await walletFactoryContract.createWallet();
      setWalletAddress('Creating wallet...');
      await tx.wait();

      const myWalletAddress = await walletFactoryContract.getMyWallet();
      setWalletAddress(myWalletAddress);

      const smartWallet = new ethers.Contract(myWalletAddress, smartWalletAbi, provider.getSigner());
      setSmartWalletContract(smartWallet);
    } catch (error) {
      console.error('Error creating wallet:', error);
    }
  };

  const deleteWallet = async () => {
    try {
      await walletFactoryContract.deleteWallet();
      setWalletAddress(null);
      setSmartWalletContract(null);
    } catch (error) {
      console.error('Error deleting wallet:', error);
    }
  };

  const transferToContract = async () => {
    try {
      const amountWei = ethers.utils.parseEther(amountInput);
      const tx = await smartWalletContract.transferToContract(contractAddressInput, amountWei, { value: amountWei });
      setTransferToContractResult('Transferring to contract...');
      await tx.wait();
      setTransferToContractResult('Transfer to contract successful');
      setContractAddressInput('');
      setAmountInput('');
    } catch (error) {
      console.error('!!!!!First Create Wallet:', error);
      setTransferToContractResult('!!!!!! First Create Wallet');
    }
  };

  const transfer = async () => {
    try {
      const amountWei = ethers.utils.parseEther(amountInput);
      const tx = await smartWalletContract.transfer(contractAddressInput, amountWei);
      setTransferResult('Transferring...');
      await tx.wait();
      setTransferResult('Transfer successful');
    } catch (error) {
      console.error('!!!!!First Create Wallet::', error);
      setTransferResult('!!!!!First Create Wallet:');
    }
  };

  const getBalance = async () => {
    try {
      if (!smartWalletContract) {
        console.error('SmartWallet contract not initialized');
        return;
      }
      const walletBalance = await smartWalletContract.getBalance();
      setBalance(ethers.utils.formatEther(walletBalance));
    } catch (error) {
      console.error('Error getting balance:', error);
    }
  };

  return (
    <div className="app-container">
      <button className="btn" onClick={connectToEthereum}>Connect to Metamask(Goerli)</button>
      {provider && (
        <div className="wallet-container">
          <p>Your smart wallet address: {walletAddress}</p>
          <div className="button-group">
            <button className="btn" onClick={createWallet}>Create Wallet</button>
            <button className="btn" onClick={deleteWallet}>Delete Wallet</button>
          </div>
          <div className="transaction-container">
            <input
              className="input-field"
              type="text"
              placeholder="Contract Address"
              value={contractAddressInput}
              onChange={(e) => setContractAddressInput(e.target.value)}
            />
            <input
              className="input-field"
              type="text"
              placeholder="Amount"
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
            />
            <button className="btn" onClick={transferToContract}>Transfer to Contract</button>
            <p className="result-text">{transferToContractResult}</p>
          </div>
          <div className="transaction-container">
            <input
              className="input-field"
              type="text"
              placeholder="Recipient Address"
              value={contractAddressInput}
              onChange={(e) => setContractAddressInput(e.target.value)}
            />
            <input
              className="input-field"
              type="text"
              placeholder="Amount"
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
            />
            <button className="btn" onClick={transfer}>Transfer</button>
            <p className="result-text">{transferResult}</p>
          </div>
          <div className="balance-container">
            <button className="btn" onClick={getBalance}>Get Balance</button>
            <p>Balance: {balance}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
