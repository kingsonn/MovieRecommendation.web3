import React from "react";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import './App.css';
import abi from "./utils/WavePortal.json"

export default function App() {

  const [currentAccount, setCurrentAccount] = useState("");
  const [allWaves, setAllWaves] = useState([]);
  ;

  const emojis = ["😀", "😁", "🙂", "😊", "🤩", "🤑", "😎", "🤓"]


  const contractAddress = "0x05705B3864027b18A50ec0C1e812Ae3ae982Ac8A"

  const contractABI = abi.abi


  const getAllWaves = async () => {
    try {
      const { ethereum } = window;
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

      /*
       * Call the getAllWaves method from your Smart Contract
       */
      const waves = await wavePortalContract.getAllWaves();

      /*
       * We only need address, timestamp, and message in our UI so let's
       * pick those out
       */
      const wavesCleaned = waves.map(wave => {
        return {
          address: wave.waver,
          timestamp: new Date(wave.timestamp * 1000),
          message: wave.message
        };
      });

      /*
       * Store our data in React State
       */
      setAllWaves(wavesCleaned);

    } catch (error) {
      console.warn(error);
    }
  }

  function cleartxtBox() {
    document.getElementById(
      'msgInput').value = ''
  }

useEffect(()=>{
const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;


      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      const accounts = await ethereum.request({ method: 'eth_accounts' });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error);
    }
  }
  checkIfWalletIsConnected();
  getAllWaves()
}, [])


  useEffect(() => {
    console.log(currentAccount, "curr")
    const { ethereum } = window;
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

    wavePortalContract.on("NewWave", (winner, prizeAmount) => {

      console.log(winner, currentAccount)

      if (Number(winner) == Number(currentAccount) ) {
        const amt = ethers.utils.formatEther(prizeAmount)

        alert("Congrats! You just won  ether for recommending movies/shows. Check your wallet balance ");
      } else {
        console.log("nextTime")
      }
    })
    return () => {
      console.log("done")
    }
  },[])

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error)
    }
  }

  const wave = async () => {
    try {
      const { ethereum } = window;
      const msg = document.getElementById("msgInput").value

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);


        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());


        const waveTxn = await wavePortalContract.wave(msg, { gasLimit: 300000 })
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);


        count = await wavePortalContract.getTotalWaves();

        console.log("Retrieved total wave count...", count.toNumber());

        getAllWaves()
        cleartxtBox()

      } else {
        alert("Please connect your wallet first")
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }


  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
          Helloooo! I'm Hanson.
        </div>

        <div className="bio">
         I am extremely bored, so if y'all could suggest some movies or shows to watch that would be great :)) <br />I like action, horror and comedy movies.
        </div>

        <div className="waverDiv">
          <h4 >Recommend a movie & you might just win some Eth 💲</h4>
          <textarea id="msgInput">
      
          </textarea>
          <button className="waveButton" onClick={wave}>👋 Here!
        </button>

        </div>

        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}

        <div className="allMsgDivs">
          {allWaves.map((wave, index) => {

            return (
              <div className="msgDiv" key={index} >
                <div > {emojis[Math.floor((Math.random() * 7) + 1)]}: {wave.message}</div>

                <div>Time: {wave.timestamp.toString().substring(0, 25)}</div>

                <div>Address: {wave.address}</div>

              </div>)
          })}
        </div>
      </div>

    </div>
  );
}
