import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux"
import 'bootstrap/dist/css/bootstrap.css'
import { Form } from "react-bootstrap";
import {ethers, utils} from 'ethers'
import {nftContractAddress} from '../contracts-config'
import nftContract from '../artifacts/KryptoPunksNFT.sol/KryptoNFT.json'
import { FixedNumber } from 'ethers'
import { CircularProgress } from "@mui/material"
const DashBord = ()  =>{
    const data = useSelector((state) => state.blockchain.value)
    const [info, setInfo] = useState({
        balance:0,
        maxMinAmountPerTx:5,
        mintCost:0.01,
        contractState:0
    })
    window.onload = function() {
        // Code to be executed after the window has reloaded
        getAppInfo()
      };

      useEffect(() => {
        if (window.ethereum !== undefined) {
            getAppInfo()
        }
    }, [data.account])

    const [isLoading, setLoading] = useState(false)

    const getAppInfo = async () => {
        
        const provider = new ethers.providers.Web3Provider(window.ethereum, "any")
        const nft_Contract = new ethers.Contract(nftContractAddress, nftContract.abi, provider)
        const balance = await provider.getBalance(nftContractAddress);
        const maxPtx = await nft_Contract.nMaxPerTx()
        const mintCost = await nft_Contract.nCostMint()
        const contractState = await nft_Contract.paused()

        console.log("Balance (Wei):", balance.toString());
        console.log("maxPtx:", maxPtx);
        console.log("mintCost (Wei):", mintCost.toString());
        console.log("contractState:", Number(contractState));

        setInfo(
            {
                balance: Number(ethers.utils.formatUnits(balance, "ether")),
                maxMinAmountPerTx:Number(maxPtx),
                mintCost:Number(ethers.utils.formatUnits(mintCost, "ether")),
                contractState:Number(contractState),
            }
        )
    
    }
    const WithDraw = async () => {
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum, "any")
            const signer = provider.getSigner()
            const nft_Contract = new ethers.Contract(nftContractAddress, nftContract.abi, signer)
            const withdraw_tx = await nft_Contract.withdraw()
            await withdraw_tx.wait()
            window.location.reload()
        }
        catch(err){
            window.alert(err)
        }
    }

    const ChangeMaxNFT = async () => {
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum, "any")
            const signer = provider.getSigner()
            const nft_Contract = new ethers.Contract(nftContractAddress, nftContract.abi, signer)
            const nft_tx = await nft_Contract.setMaxPerTx(info.maxMinAmountPerTx)
            await nft_tx.wait()
            window.location.reload()
        }
        catch(err){
            window.alert(err)
        }
    }
    const ChangeMintCost = async () => {
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum, "any")
            const signer = provider.getSigner()
            const nft_Contract = new ethers.Contract(nftContractAddress, nftContract.abi, signer)
            const mint_tx = await nft_Contract.setCost(ethers.utils.parseEther(String(info.mintCost), "ether"))
            await mint_tx.wait()
            window.location.reload()
        }
        catch(err){
            window.alert(err)
        }
    }
    const ChangeContractState = async () => {
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum, "any")
            const signer = provider.getSigner()
            const nft_Contract = new ethers.Contract(nftContractAddress, nftContract.abi, signer)
            const change_stat = 0;
            if (info.contractState === 0)
                change_stat = await nft_Contract.setActive(1)
            else
                change_stat = await nft_Contract.setActive(0)
            await change_stat.wait()
            window.location.reload()
        }
        catch(err){
            window.alert(err)
        }
    }


    return(
        <>
            <div className="row mx-auto">
                <div className="col-ms-3"></div>
                <div className="col-ms-6">
                    <h4>Owner Dashboard</h4>
                    <div className="d-flex">
                        <div className="col-8 align-content-start ">
                            <div>
                                <label className="">Current balance : {Number(info.balance).toFixed(20)} ETH</label>
                            </div>
                            <div>
                                <label>  </label>
                            </div>
                        </div>
                        <div className="col-4 align-content-end">
                            <button  type = "button" className="btn btn-info d-flex justify-content-end text-black " onClick={() => WithDraw()}>{isLoading? <CircularProgress color="inherit" size ={18}/> : null}withdraw</button>
                        </div>
                    </div>
                    <div className="d-flex">
                        <div className="col-8">
                        <div>
                            <label>Max NFT minted per transaction: </label>
                            </div>
                            <div>
                                <Form.Control type="Number" value={info.maxMinAmountPerTx} onChange={(e) => setInfo({...info, maxMinAmountPerTx:e.target.value})}/>
                            </div>
                        </div>
                        <div className="col-4 align-content-end">
                            <button className="btn btn-info text-black" onClick={ChangeMaxNFT}>{isLoading? <CircularProgress color="inherit" size ={18}/> : null}Change</button>
                        </div>
                    </div>
                    <div className="d-flex">
                        <div className="col-8">
                        <div>
                                <label>NFT mint cost (ETH) : </label>
                            </div>
                            <div>
                                <Form.Control type="Number" value={info.mintCost} onChange={(e) => setInfo({...info, mintCost: e.target.value})}/>
                            </div>
                            
                        </div>
                        <div className="col-4 align-content-end">
                            <button className="btn btn-info text-black" onClick={ChangeMintCost}>{isLoading? <CircularProgress color="inherit" size ={18}/> : null}Change</button>
                        </div>
                    </div>
                    <div className="d-flex mt-20">
                        <div className="col-8 align-content-center">
                        <div >
                            <label >Nft Contract is : </label>
                            </div>
                            <div>
                                {
                                    info.contractState === 0?
                                    (<text>paused</text>) :
                                    (<text>active</text>)
                                }
                            </div>
                        </div>
                        <div className="col-4 align-content-end">
                            <button className="btn btn-info text-black" onClick={ChangeContractState}>{isLoading? <CircularProgress color="inherit" size ={18}/> : null}{info.contractState == 0 ? "Active" : "Pause"}</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default DashBord;