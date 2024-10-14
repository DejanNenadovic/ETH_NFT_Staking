import React, { useState, useEffect } from 'react';
import { ethers, utils } from 'ethers';
import Web3Modal from "web3modal";
import 'bootstrap/dist/css/bootstrap.css';
import {Modal, Button} from 'react-bootstrap';
import DashBord from './dashboard';
import MintPage from './mintPage';
import {ownerAddress} from '../contracts-config'

import { useDispatch, useSelector } from "react-redux"
import { updateAccountData, disconnect } from "./blockchain"

const eth = window.ethereum
let web3Modal = new Web3Modal()

const WalletConnect = () => {
    const dispatch = useDispatch()
    const data = useSelector((state) => state.blockchain.value)

    const [injectedProvider, setInjectedProvider] = useState();
    const [bShowModal, setShowModal] = useState(false)
    // const [isConnected, setConnection] = useState(false)
    // const [account, setaccount] = useState()
    // const [balance, setbalance] = useState()
    // const [net, setNetwork] = useState()
    const connectWallet = async () => {
    try {
        console.log("wallet connecting....")
        if (typeof window.ethereum !== 'undefined') 
        {
            console.log("wallet connected!!!")
            const connection = await web3Modal.connect();
            const provider = new ethers.providers.Web3Provider(connection);

            const signer = provider.getSigner();

            const net = await provider.getNetwork();
            const userAddress = await signer.getAddress();
            const balance = await signer.getBalance();
            
            // setaccount(userAddress)
            // setbalance(Number(ethers.utils.formatUnits(balance, "ether")))
            // setNetwork(net)
            // setConnection(true)
            // setInjectedProvider(provider)
            
            dispatch(updateAccountData({
                account:userAddress,
                balance:utils.formatUnits(balance),
                network:net
            }))
            console.log({
                account:userAddress,
                balance:utils.formatUnits(balance),
                network:net
            })
        }
        else {
            console.error('Please install a Web3 compatible browser extension like MetaMask.');
        }
    } catch (error) {
      console.error('Error connecting to wallet:', error);
    }
  };

  const disconnectWallet = async () => {
    console.log("wallet disconnected....")
    web3Modal.clearCachedProvider();
    if (injectedProvider && injectedProvider.provider)
    {
        setInjectedProvider(null);
    }   
    dispatch(disconnect())
    // setaccount("")
    // setbalance('')
    // setConnection(false)
    setShowModal(false);
  }
  
  useEffect(() => {
    console.log("useEffect before....")
    if (eth) {
        console.log("eth is valid...")
        eth.on('chainChanged', (chainId) => {
            connectWallet()
        })
        eth.on('accountsChanged', (accounts) => {
            connectWallet()
        })
    }
}, [])
  const isConnected = data.account !== ''

  return (
    <>
       
      {isConnected ? (
         <div className='row'>
        <div className='col-4'></div>
        <div className='col-4'>
        <>
        <button className="btn btn-info" onClick={() => {setShowModal(true)}}>{data.account}</button>
        <Modal show={bShowModal} onHide={() => setShowModal(false)}>
            <Modal.Header>
                <Modal.Title>User</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>{ownerAddress === data.account? 'Owner : ' : 'User : '}{data.account}</p>
                <p>balance : {data.balance && parseFloat(data.balance).toFixed(30)} ETH</p>                
            </Modal.Body>
                <Button  onClick={disconnectWallet}>Disconnect</Button>
            <Modal.Footer>
            </Modal.Footer>
        </Modal>
        </>
        </div>
        <div className='col-4'></div>
        </div>
      ) : (
        <div className='row'>
            <div className='col-4'></div>
            <div className='col-4'>
                <button className="btn btn-info" style={{width:'150px'}} onClick={connectWallet}>Connect Wallet</button>
                </div>
            <div className='col-4'></div>
            
        </div>
      )}
     
    <div className='row' style={{height:'400px'}}>
    <div className='col-sm-4  text-black'><div className='row' style={{height:'370px'}}>
        {ownerAddress === data.account? <DashBord/> : <></>}
    </div></div>
    <div className='col-sm-8  text-black'>
        {isConnected ? <MintPage/>:<></>}
    </div>
    </div>
    
    

    </>
  );
};

export default WalletConnect;