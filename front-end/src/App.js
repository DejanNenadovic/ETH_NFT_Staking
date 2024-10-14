import logo from './logo.svg';
import './App.css';
import 'bootstrap/dist/css/bootstrap.css'
import WalletConnect from './components/walletConnect';


function App() {
  return (
  <div>
    <div className='row' style={{height:'100px'}}>
      <div className='col-sm-4  text-black'>
      </div>
      <div className='col-sm-4  text-black'>
      <div style={{height:'10%'}}></div>
      <h2 className=''>NFT Staking</h2>

      </div>
      <div className='col-sm-4  text-black'>
      </div>
      </div>
    
        <WalletConnect />
    
    
  </div>
  );
}

export default App;
