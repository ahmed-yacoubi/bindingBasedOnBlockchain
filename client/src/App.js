import React, {Component} from "react";
import BindingContract from "./contracts/BindingContract.json";
import getWeb3 from "./getWeb3";
import 'bootstrap/dist/css/bootstrap.min.css';
import "./App.css";
import {invoke, mcall} from "q";

// const web3 = require('web3');

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

    createNewRequestToBinding = async () => {
        const {accounts, contract} = this.state;
        let details = [this.convertStringToBytes('price', 16)
            , this.convertStringToBytes('amount', 16),
            this.convertStringToBytes('volume1', 16)];

        try {
            //        uint64 _companyId,
            //         bytes16 _fullName,
            //         bytes16 _phoneNo,
            //         uint32 _price,
            //         uint64 _bindingId,
            //         bytes16 [] memory _details
            await contract.methods.requestToBinding(
                10,
                this.convertStringToBytes("my company 1", 16),
                this.convertStringToBytes("0599967638", 16),
                5005,
                1, details
            ).send({from: accounts[0]});
        } catch (err) {
            this.handelError(err.message)
        }

    }

    handelError(err) {
        const endIndex = err.search('"}')
        const startIndex = err.search('reason') + 9
        if (endIndex >= 0) {
            alert("Error! : " + err.substring(startIndex, endIndex))
        }
    }

    convertStringToBytes(string, bytesLength) {
        const {web3} = this.state;
        return web3.utils.fromAscii(string, bytesLength);
    }


    getAllBinding = () => {
        const {accounts, contract, web3} = this.state;

        contract.methods.getBindingContractsCount().call({from: accounts[0]}).then(function (count) {
            alert("binding count : " + count)

            for (let i = 1; i <= count; i++) {
                contract.methods.getBindingById(i).call({from: accounts[0]}).then(function (data, err) {
                    if (data != null && data[0] > 0) {
                        const bindingId = data[0];
                        const name = web3.utils.hexToUtf8(data[1]);
                        const startDate = data[2];
                        const endDate = data[3];
                        let details = [];
                        const points = data[5];
                        data[4].forEach((detail) => {
                            details.push(web3.utils.hexToUtf8(detail));
                        });
                        const address = data[6];
                        console.log("bindingId: " + bindingId + " ,name: " + name
                            + "startDate: , " + startDate + " , endDate: " + endDate + " , address:  " + address + " , details:" + details + " , points: " + points)
                        alert("bindingId: " + bindingId + "\n\nname: " + name
                            + "\n\nstartDate: , " + startDate + " \n\nend Date: " + endDate + "\n\naddress:  " + address + "\n\ndetails: " + details + " \n\npoints: " + points)
                    }
                });


            }
        });

    }
    getAllRequestBindings = () => {
        const {accounts, contract, web3} = this.state;

        contract.methods.getBindingRequestCount().call({from: accounts[0]}).then(function (count) {
            alert("binding count : " + count)
            for (let i = 1; i <= count; i++) {
                contract.methods.getBindingRequestByRequestId(i).call({from: accounts[0]}).then(function (data) {
                    if (data != null && data[0] > 0) {
                        alert(data)
                    }
                });
            }
        });

    }

    getActiveBindingContracts = () => {
        const {accounts, contract, web3} = this.state;

        contract.methods.getBindingContractsCount().call({from: accounts[0]}).then(function (count) {

            for (let i = 1; i <= count; i++) {
                contract.methods.getActiveBinding(i).call({from: accounts[0]}).then(function (data) {
                    if (data != null && data[0] > 0) {
                        const bindingId = data[0];
                        const name = web3.utils.hexToUtf8(data[1]);
                        const startDate = data[2];
                        const endDate = data[3];
                        let details = [];
                        const points = data[5];
                        data[4].forEach((detail) => {
                            details.push(web3.utils.hexToUtf8(detail));
                        });
                        const address = data[6];
                        console.log("bindingId: " + bindingId + " ,name: " + name
                            + "startDate: , " + startDate + " , endDate: " + endDate + " , address:  " + address + " , details:" + details + " , points: " + points)
                        alert("bindingId: " + bindingId + "\n\nname: " + name
                            + "\n\nstartDate: , " + startDate + " \n\nend Date: " + endDate + "\n\naddress:  " + address + "\n\ndetails: " + details + " \n\npoints: " + points)
                    }

                });


            }
        });

    }
    getClosedBindingContracts = () => {
        const {accounts, contract, web3} = this.state;

        contract.methods.getBindingContractsCount().call({from: accounts[0]}).then(function (count) {

            for (let i = 1; i <= count; i++) {

                contract.methods.getClosedBinding(i).call({from: accounts[0]}).then(function (data) {
                    if (data != null && data[0] > 0) {

                        const bindingId = data[0];
                        const name = web3.utils.hexToUtf8(data[1]);
                        const startDate = data[2];
                        const endDate = data[3];
                        let details = [];
                        const points = data[5];
                        data[4].forEach((detail) => {
                            details.push(web3.utils.hexToUtf8(detail));
                        });
                        const address = data[6];
                        console.log("bindingId: " + bindingId + " ,name: " + name
                            + "startDate: , " + startDate + " , endDate: " + endDate + " , address:  " + address + " , details:" + details + " , points: " + points)
                        alert("bindingId: " + bindingId + "\n\nname: " + name
                            + "\n\nstartDate: , " + startDate + " \n\nend Date: " + endDate + "\n\naddress:  " + address + "\n\ndetails: " + details + " \n\npoints: " + points)
                    }
                });
            }


        });

    }

    handleSubmit = async (event) => {
        event.preventDefault();
        const {accounts, contract} = this.state;
        console.log(accounts[0]); // come from metamask
        //        string memory _name,
        //         uint256 _startDate,
        //         uint256 _endDate,
        //         string[] memory details,
        //         uint256[] memory points
        let details = [this.convertStringToBytes('price', 16)
            , this.convertStringToBytes('amount', 16), this.convertStringToBytes('volume', 16)
            , this.convertStringToBytes('total', 16)

        ];
        let points = [1, 3, 6, 3 ];

        try {
            await contract.methods.createBindingContract(
                this.convertStringToBytes('binding name', 16),
                parseInt(Date.now() / 1000),
                parseInt((Date.now() / 1000)) + 10000,
                details,
                points,
            ).call({from: accounts[0]}).then((result) => {
                    alert(result)
                });
        } catch (err) {
            this.handelError(err.message)
        }
        //
        // try {
        //     await contract.methods.createBindingContract(
        //         this.convertStringToBytes('ahmed', 16),
        //         parseInt(Date.now() / 1000),
        //         parseInt((Date.now() / 1000)) + 10000,
        //         details,
        //         points
        //     ).send({from: accounts[0]});
        // } catch (err) {
        //     this.handelError(err.message)
        // }

    }


//string memory _id,
//         string memory _name, string memory _fullName, string memory _phoneNo,
//         uint64 _price, uint _totalPoint, uint64 _bindingId
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
                                <button className="btn btn-primary"
                                        onClick={this.createNewRequestToBinding}>create new request to binding
                                </button>

                                <button className="btn btn-primary" onClick={this.getAllRequestBindings}>get all request
                                    bindings
                                </button>
                                <button className="btn btn-primary" onClick={this.getAllBinding}>get all binding
                                </button>
                                <button className="btn btn-primary" onClick={this.getActiveBindingContracts}>get active
                                    binding contracts
                                </button>
                                <button className="btn btn-primary" onClick={this.getClosedBindingContracts}>get close
                                    binding contracts
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
