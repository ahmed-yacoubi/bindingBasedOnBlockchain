import Web3 from "web3";

const getWeb3 = () =>
  new Promise((resolve, reject) => {
    // Wait for loading completion to avoid race conditions with web3 injection timing.
    window.addEventListener("load", async () => {
      // Modern dapp browsers...
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        try {
          // Request account access if needed
          await window.ethereum.enable();
          // Accounts now exposed
          resolve(web3);
        } catch (error) {
          reject(error);
        }
      }
      // Legacy dapp browsers...
      else if (window.web3) {
        // Use Mist/MetaMask's provider.
        const web3 = window.web3;
        console.log("Injected web3 detected.");
        resolve(web3);
      }
      // Fallback to localhost; use dev console port by default...
      else {
        const provider = new Web3.providers.HttpProvider(
          "http://127.0.0.1:8545"
        );
        const web3 = new Web3(provider);
        console.log("No web3 instance injected, using Local web3.");
        resolve(web3);
      }
    });
  });

export default getWeb3;


/*import React, {Component} from "react";
import BindingContract from "./contracts/BindingContract.json";
import getWeb3 from "./getWeb3";
import 'bootstrap/dist/css/bootstrap.min.css';
import "./App.css";

const web3 = require('web3');

class App extends Component {
    state = {storageValue: 0, web3: null, accounts: null, contract: null};

    async initContract() {
        try {
            const web3 = await getWeb3();
            const accounts = await web3.eth.getAccounts();
            const networkId = await web3.eth.net.getId();
            const deploy = BindingContract.networks[networkId];
            const instance = new web3.eth.Contract(BindingContract.abi, deploy && deploy.address);
            this.setState({
                web3,
                accounts,
                contract: instance
            });
        } catch (error) {
            alert(
                `Failed to load web3, accounts, or contract. Check console for details.`,
            );
            console.error(error);
        }
    }

    constructor() {
        super();
        this.initContract()
    }


    handleInputChanges = async (event) => {
        let nam = event.target.name;
        let val = event.target.value;
        console.log("name" + nam);
        console.log("val" + val);

        this.setState({
            [nam]: val
        });
    }

    getBindingContracts = (event) => {
        const {accounts, bindingContract} = this.state;
        bindingContract.methods.getBindingContractsCount().call().then(function (numOfContracts) {

            for (var i = 1; i <= numOfContracts; i++) {

                bindingContract.methods.getBindingById(i).call().then(function (id, address, startTime, endTime, name) {
                    console.log("id : " + id + " name : " + name + " address : " + address + " startTime :" + startTime + " endTime : " + endTime);
                });
            }

        });

    }

    getContracts = (event) => {
        const {accounts, contract} = this.state;
        contract.methods.getContractCount().call()
            .then(function (count) {
                console.log(count);
                for (var i = 1; i <= count; i++) {
                    console.log(i);
                    contract.methods.getContractById(i).call()
                        .then(function (data) {
                            var resultContract = new ContStruct(data); // send data to api
                            var jsonData = {
                                id: resultContract.id,
                                onwerName: resultContract.ownerName,
                                onwerAddress: resultContract.ownerAddress,
                                countDesc: resultContract.countDesc,
                                countType: resultContract.countType,
                                startDate: resultContract.startDate,
                                endDate: resultContract.endDate,
                                muicilialty: resultContract.municipality
                            };

                            console.log(jsonData);
                        });
                }
            });
    }

    handleSubmit = async (event) => {
        event.preventDefault();
        const {accounts, contract, contractCoin, bindingContract} = this.state;
        console.log(accounts[0]); // come from metamask
        // await contractCoin.methods.sendCoin('0x8978782a70E741a73BE5f9c4C24C3DA6338E9468', 100000)
        //     .send({from: accounts[0]});
        //

        // await contract.methods.createContract(
        //     this.state.contractid,
        //     web3.utils.fromAscii(this.state.ownername, 16),
        //     web3.utils.fromAscii(this.state.contractdesc, 16),
        //     this.state.contracttype,
        //
        //     web3.utils.fromAscii(this.state.startdate, 16),
        //     web3.utils.fromAscii(this.state.enddate, 16),
        //     web3.utils.fromAscii(this.state.municipality, 16),
        //     web3.utils.fromAscii('not now', 16)
        // ).send({from: accounts[0]});
//string memory _name, uint _startDate, uint _endDate
        alert(accounts[0])
        await bindingContract.methods.createBindingContract(
            "name : ",
            100,
            200
        ).send({from: accounts[0]});
    }

    render() {
        if (!this.state.web3) {
            return <div>Loading Web3, accounts, and contract...</div>;
        }
        return (
            <div className="App">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <h1>Welcome to the second use case session!</h1>
                            <div className="form-group">
                                <form onSubmit={this.handleSubmit}>
                                    <label htmlFor="contractid">Contract ID</label>
                                    <input className="form-control" name="contractid" placeholder="contractid"
                                           onChange={this.handleInputChanges}></input>
                                    <label htmlFor="ownername">0wner Name</label>
                                    <input className="form-control" name="ownername" placeholder="Owner Name"
                                           onChange={this.handleInputChanges}></input>
                                    <label htmlFor="contractdesc">Contract Description</label>
                                    <input className="form-control" name="contractdesc"
                                           placeholder="Contract Description"
                                           onChange={this.handleInputChanges}></input>
                                    <label htmlFor="contracttype">Contract Type</label>
                                    <select className="form-control" name="contracttype"
                                            onChange={this.handleInputChanges}>
                                        <option value="1">Land Contract</option>
                                        <option value="2">Home Contract</option>
                                        <option value="3">Shop Contract</option>
                                        <option value="4">Building Con'tract</option>
                                    </select>
                                    <label htmlFor="municipality">Municipality</label>

                                    <select className=" form-control" name="municipality"
                                            onChange={this.handleInputChanges}>
                                        <option value="1">Khan Younes</option>
                                        <option value="2">Deir Al Balah</option>
                                        <option value="3">Gaza</option>
                                        <option value="4">Rafah</option>
                                        <option value="5">Jenin</option>
                                        <option value="6">Nablus</option>
                                        <option value="7">Jerusalem</option>
                                        <option value="8">Haifa</option>
                                        <option value="9">Acre</option>
                                    </select>
                                    <label htmlFor="startdate">Start Date</label>
                                    <input className="form-control" name="startdate" placeholder="Start Date "
                                           onChange={this.handleInputChanges}></input>
                                    <label htmlFor="enddate">End Date</label>
                                    <input className="form-control" name="enddate" placeholder="Start Date"
                                           onChange={this.handleInputChanges}></input>


                                    <label htmlFor="contractimage">Contract Image</label>
                                    <input type="file" className="form-control" name="contractimage"
                                           placeholder="Contract Image"/>
                                    <input type="submit" className="btn btn-primary"/>


                                </form>
                                <button className="btn btn-primary" onClick={this.getBindingContracts}>get contracts
                                </button>
                                <label id="demo1"> </label>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default App;
*/