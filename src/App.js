import { createContext, useEffect, useState } from "react";
import { ethers } from "ethers";

// Components
import Navigation from "./components/Navigation";
import Search from "./components/Search";
import Home from "./components/Home";

// ABIs
import RealEstate from "./abis/RealEstate.json";
import Escrow from "./abis/Escrow.json";

// Config
import config from "./config.json";

export const EtherContext = createContext(null);

function App() {
  const [account, setAccount] = useState();
  const [escrow, setEscrow] = useState();
  const [currentProvider, setCurrentProvider] = useState();
  const [homes, setHomes] = useState([]);

  const loadBlockchainData = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    setCurrentProvider(provider);

    provider.provider.on("accountsChanged", (accounts) => {
      setAccount(accounts[0]);
    });

    const network = await provider.getNetwork();

    const realEstate = new ethers.Contract(
      config[network.chainId].realEstate.address,
      RealEstate,
      provider
    );

    const totalSupply = await realEstate.totalSupply();

    for (let i = 1; i <= totalSupply; i++) {
      const uri = await realEstate.tokenURI(i);
      const response = await fetch(uri);
      const metadata = await response.json();
      setHomes((homes) => [...homes, metadata]);
    }

    const escrow = new ethers.Contract(
      config[network.chainId].escrow.address,
      Escrow,
      provider
    );
    setEscrow(escrow);
  };

  useEffect(() => {
    loadBlockchainData();
  }, []);

  return (
    <EtherContext.Provider value={currentProvider}>
      <div>
        <Navigation account={account} setAccount={setAccount} />
        <Search />
        <div className="cards__section">
          <h3>Home for you</h3>
          <hr />
          <div className="cards">
            {homes.map((home, index) => (
              <div className="card" key={index} onClick={() => {}}>
                <div className="card__image">
                  <img src={home.image} alt="Home" />
                </div>
                <div className="card__info">
                  <h4>{home.attributes[0].value} ETH</h4>
                  <p>
                    <strong>{home.attributes[2].value}</strong> bds |
                    <strong>{home.attributes[3].value}</strong> ba |
                    <strong>{home.attributes[4].value}</strong> sqft
                  </p>
                  <p>{home.address}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </EtherContext.Provider>
  );
}

export default App;
