import React, { useState, useEffect } from "react";
import 'bootstrap/dist/css/bootstrap.css'
import { ethers, utils } from "ethers";
import { useSelector } from "react-redux";
import { stakingContractAddress, nftContractAddress, ownerAddress, networkDeployedTo } from "../contracts-config";
import nftContract from '../artifacts/KryptoPunksNFT.sol/KryptoNFT.json'
import stakingContract from '../artifacts/KryptoStaking.sol/KryptoVault.json'
import axios from "axios"
import { CircularProgress } from "@mui/material"
import { isAllOf } from "@reduxjs/toolkit";

const MintPage = ()  =>{
    const data = useSelector((state) => state.blockchain.value)
    const totalSupply = 30;
    const [info, setInfo] = useState({
        nCountNFTminted: 0,
        mintCost: 0.01,
        maxAmountPtx:5,
        OwnNFTs:[],//
        paused:0,
        numberStaked:0,
        NFTsStaked:[],
        Reward:0
    })
    const [nfts, setUserNfts] = useState([])
    const [count, setCount] = useState(1)
    const [isLoading, setLoading] = useState(false)
    const [cntNFT, setCountNFT] = useState(0)
    const increaseCount = () => {
        if (count < info.maxAmountPtx)
            setCount(count + 1)
    }
    const decreaseCount = () => {
        if (count > 1)
        setCount(count - 1)
    }
    const getAppInfo = async () => {
        try{
            const provider = new ethers.providers.Web3Provider(window.ethereum, "any")
            const nft_Contract = new ethers.Contract(nftContractAddress, nftContract.abi, provider)
            const staking_Contract = new ethers.Contract(stakingContractAddress, stakingContract.abi, provider)
            
            const signer = provider.getSigner()
            const user = await signer.getAddress()

            var MintedNFTs = Array.from((await nft_Contract.tokensOfOwner(user)), x => Number(x))
            const cost = await nft_Contract.nCostMint()
            const maxPtx = await nft_Contract.nMaxPerTx()
            
            const paused = await nft_Contract.paused()

            const nStaked = await staking_Contract.totalItemsStaked()
            const reward = await staking_Contract.getTotalReward(user)
            const stakedNFTs = Array.from((await staking_Contract.tokensOfOwner(user)), x => Number(x))
            const baseUri = await nft_Contract.uriBase()
            const baseExtension = await nft_Contract.uriExtension()
            console.log("minted NFTs : " + MintedNFTs.join(",")  + " stakedNFTs :  " + stakedNFTs.join(","))
            MintedNFTs = MintedNFTs.concat(stakedNFTs).sort()
            

            
            console.log("ConCated NFTs : " + MintedNFTs.join(","))
            // console.log("maxPtx:", Number(maxPtx));
            // console.log("mintCost (Wei):", Number(ethers.utils.formatUnits(cost, "ether")))
            // console.log("paused:", Number(paused))
            // console.log("numberStaked:", Number(nStaked))
            // console.log("Reward:", Number(ethers.utils.formatUnits(reward, "ether")))
            // console.log("nCountNFTminted:", MintedNFTs.length)

            setInfo({
                nCountNFTminted: MintedNFTs.length,
                mintCost: Number(ethers.utils.formatUnits(cost, "ether")),
                maxAmountPtx:Number(maxPtx),
                OwnNFTs:MintedNFTs,
                paused:Number(paused),
                numberStaked:Number(nStaked),
                NFTsStaked:stakedNFTs,
                Reward:Number(ethers.utils.formatUnits(reward, "ether"))
            })
            console.log("getAppInfo's SetInfo is finished.")

            const userNfts = await Promise.all(MintedNFTs.map( async (nft) => {
                console.log("NFT img URL is setting.....")
                const metadata = await axios.get(baseUri.replace("ipfs://", "https://ipfs.io/ipfs/") + "/" + nft.toString() + baseExtension)
                return{
                    id: nft,
                    uri: metadata.data.image.replace("ipfs://", "https://ipfs.io/ipfs/")
                }

            }))

            setUserNfts(userNfts)

        }
        catch(err){
            console.log("error : " + err)
        }
    }
    const Mint = async () => {
        try{
            if (info.paused == 1)
            {
                setLoading(true)
                const provider = new ethers.providers.Web3Provider(window.ethereum, "any")
                const signer = provider.getSigner()
                const nft_Contract = new ethers.Contract(nftContractAddress, nftContract.abi, signer)
                if (ownerAddress == data.account)
                {
                    console.log("Owner is minting....")
                    const mint = await nft_Contract.mint(count)
                    await mint.wait()
                    console.log("Owner's minting is Finished....")
                }
                else
                {
                    const totalMintCost = ethers.utils.parseEther(String(info.mintCost * count), "ether")
                    console.log("user minting.... TotalCost : " + totalMintCost)
                    const mint = await nft_Contract.mint(count, {value: totalMintCost})
                    await mint.wait()
                }
                console.log("minting is finished'....")
                setLoading(false)
                getAppInfo()
            }
        }
        catch(err)
        {
            setLoading(false)
            window.alert(err)
        }
    }
    const Claim = async () => {
        try{
            if (info.paused == 1)
            {
                setLoading(true)
                const provider = new ethers.providers.Web3Provider(window.ethereum, "any")
                const signer = provider.getSigner()
                const staking_Contract = new ethers.Contract(stakingContractAddress, stakingContract.abi, signer)
                const claim = await staking_Contract.claim(info.NFTsStaked)
                await claim.wait()
                setLoading(false)
                getAppInfo()
            }
        }
        catch(err)
        {
            setLoading(false)
            window.alert(err)
        }
    }
    const UnstakeAll = async () => {
        try{
            if (info.paused == 1)
            {
                setLoading(true)
                const provider = new ethers.providers.Web3Provider(window.ethereum, "any")
                const signer = provider.getSigner()
                const staking_Contract = new ethers.Contract(stakingContractAddress, stakingContract.abi, signer)
                const unstake = await staking_Contract.unstake(info.NFTsStaked)
                await unstake.wait()
                setLoading(false)
                getAppInfo()
            }
        }
        catch(err)
        {
            setLoading(false)
            window.alert(err)
        }
    }
    const UnstakeOne = async (tokenId) => {
        try{
            if (info.paused == 1)
            {
                setLoading(true)
                const provider = new ethers.providers.Web3Provider(window.ethereum, "any")
                const signer = provider.getSigner()
                const staking_Contract = new ethers.Contract(stakingContractAddress, stakingContract.abi, signer)
                const unstake = await staking_Contract.unstake([tokenId])
                await unstake.wait()
                setLoading(false)
                getAppInfo()
            }
        }
        catch(err)
        {
            setLoading(false)
            window.alert(err)
        }
    }
    
    const stakeOne = async (tokenId) => {
        try{
            if (info.paused == 1)
            {
                setLoading(true)
                const provider = new ethers.providers.Web3Provider(window.ethereum, "any")
                const signer = provider.getSigner()
                const nft_Contract = new ethers.Contract(nftContractAddress, nftContract.abi, signer)
                const stake_tx = await nft_Contract.approve(stakingContractAddress, tokenId)
                await stake_tx.wait()

                const staking_Contract = new ethers.Contract(stakingContractAddress, stakingContract.abi, signer)
                const stake = await staking_Contract.stake([tokenId])
                await stake.wait()
                setLoading(false)
                getAppInfo()
            }
        }
        catch(err)
        {
            setLoading(false)
            window.alert(err)
        }
    }

    window.onload = function() {
        getAppInfo()
      };
    useEffect(() => {
        getAppInfo()
    }, [data.account])

    return(
        <><div className="row">
            <div className='row' style={{height: '37px'}}></div>
            <div className="col-6">
                <h4>Minting Info</h4>
            <div className='row' style={{height: '300px'}}>
                <table>
                    <tbody>
                    <tr>
                        <td>Total Collection Supply</td>
                        <td>{totalSupply}</td>
                    </tr>
                    <tr>
                        <td>Minted NFT Count</td>
                        <td>{info.nCountNFTminted}</td>
                    </tr>
                    <tr>
                        <td>Mint Cost</td>
                        <td>{info.mintCost} ETH</td>
                    </tr>
                    <tr>
                        <td>Max Mint Amount Per Tx</td>
                        <td>{info.maxAmountPtx}</td>
                    </tr>
                    </tbody>
                </table>
            </div>
            <div className='row d-flex p-3' style={{height: '20px'}}>
                <div className="d-flex col-4 ">
                    <button type = "button" className="flex-fill p-2 btn btn-info d-flex justify-content-center text-black " onClick={decreaseCount}>-</button>
                    <label className='flex-fill d-flex justify-content-center align-self-center'>{count}</label>
                    <button type = "button" className="flex-fill p-2 btn btn-info d-flex justify-content-center text-black " onClick={increaseCount}>+</button>
                </div>
                <div className="d-flex col-1"></div>
                <div className="col-4">
                    <div type = "button" className="p-2 btn btn-info d-flex justify-content-center text-black w-10" onClick={Mint}>{isLoading? <CircularProgress color="inherit" size ={18}/> : null}Mint</div>
                </div>
                <div className="d-flex col-3"></div>
                
            </div>
            </div>
            <div className="col-6">
            <h4>Staking Info</h4>
            <div className='row' style={{height: '300px'}}>
                <table>
                    <tbody>
                    <tr>
                        <td>Your KryptoPunks</td>
                        <td>[{info.OwnNFTs.join(",")}]</td>
                    </tr>
                    <tr>
                        <td>Item Count</td>
                        <td>{info.OwnNFTs.length}</td>
                    </tr>
                    <tr>
                        <td>Items Staked</td>
                        <td>[{(info.NFTsStaked).join(",")}]</td>
                    </tr>
                    <tr>
                        <td>Earned Reward</td>
                        <td>{info.Reward}</td>
                    </tr>
                    </tbody>
                </table>
            </div>
            <div className='row d-flex p-3' style={{height: '20px'}}>
                <div className="d-flex col-6 ">
                    <button type = "button" className="flex-fill p-2 btn btn-info d-flex justify-content-center text-black " onClick={() => setCountNFT(cntNFT-1)} disabled={cntNFT == 0}>prev</button>
                    <label className='flex-fill d-flex justify-content-center align-self-center'>{(info.OwnNFTs)[cntNFT]}</label>
                    <button type = "button" className="flex-fill p-2 btn btn-info d-flex justify-content-center text-black " onClick={() => setCountNFT(cntNFT+1)} disabled={cntNFT == ((info.OwnNFTs).length - 1)}>next</button>
                    <div style={{width:'10px'}}></div>
                    <button type = "button" className="flex-fill p-2 btn btn-info d-flex justify-content-center text-black " onClick={() => stakeOne((info.OwnNFTs)[cntNFT])}>{isLoading? <CircularProgress color="inherit" size ={18}/> : null}StakeOne</button>
                </div>
                <div className="d-flex col-2 ">
                    <button type = "button" className="flex-fill p-2 btn btn-info d-flex justify-content-center text-black " onClick={Claim}>{isLoading? <CircularProgress color="inherit" size ={18}/> : null}Claim</button>
                </div>
                <div className="col-4">
                    <div type = "button" className="p-2 btn btn-info d-flex justify-content-center text-black w-10" onClick={UnstakeAll}>{isLoading? <CircularProgress color="inherit" size ={18}/> : null}Unstake All</div>
                </div>
            </div>
            </div>
            </div>
            <div style={{marginTop:'100px', height:'500px'}}>
                {nfts.length !== 0 ? 
                (
                <>
                <div className="row">
                    <h3>My NFTs</h3>
                </div>  
                <div className="row" style={{display:'flex', flexWrap:'warp'}}>
                {
                    nfts.map((nft, id) => {
                    return(<div style={{width:'200px', height:'230px'}}>
                    <div style={{width:'200px', height:'200px'}}>
                        <img src={nft.uri}></img>
                        {(info.NFTsStaked).includes(nft.id) ?
                        (<button onClick={() => UnstakeOne(nft.id)}>{isLoading? <CircularProgress color="inherit" size ={18}/> : null}UnStake</button>) : (<button onClick={() => stakeOne(nft.id)}>{isLoading? <CircularProgress color="inherit" size ={18}/> : null}Stake</button>) }
                    </div></div>
                )})
                }
                </div>
                </>): null}
            </div>
        </>
    )
}

export default MintPage;