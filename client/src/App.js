import React, {Component} from "react";
import BindingContract from "./contracts/BindingContract.json";
import getWeb3 from "./getWeb3";
import 'bootstrap/dist/css/bootstrap.min.css';
import "./App.css";

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

// common method -- start (2)
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

// common method -- end
// insert , update data in blockchain -- start (6)

    signUpMunicipality = async () => {
        const {accounts, contract} = this.state;

        try {
            await contract.methods.signUpMunicipality(
                4, this.convertStringToBytes('ahmed', 16), this.convertStringToBytes('0599967638', 16),
                this.convertStringToBytes('123123', 16)
            ).send({from: accounts[0]}).then((result) => {
                alert(result)
            });
        } catch (err) {
            this.handelError(err.message)
        }
    }
    signUpCompany = async () => {
        const {accounts, contract} = this.state;

        try {
            await contract.methods.signUpCompany(
                4, this.convertStringToBytes('ahmed', 16), this.convertStringToBytes('0599967638', 16),
                this.convertStringToBytes('computer', 16),
                this.convertStringToBytes('123123', 16)
            ).send({from: accounts[0]}).then((result) => {
                alert(result)
            });
        } catch (err) {
            this.handelError(err.message)
        }
    }

    createNewRequestToBinding = async () => {
        const {accounts, contract} = this.state;
        let details = [this.convertStringToBytes('price', 16)
            , this.convertStringToBytes('amount', 16),
            this.convertStringToBytes('volume1', 16)];

        try {

            await contract.methods.requestToBinding(
                10,
                this.convertStringToBytes("my company 1", 16),
                this.convertStringToBytes("0599967638", 16),
                5005,
                1, details, this.convertStringToBytes('123123', 16)
            ).send({from: accounts[0]});
        } catch (err) {
            this.handelError(err.message)
        }

    }
    openBinding = async () => {
        const {accounts, contract} = this.state;

        try {//uint64 _bindingId, uint64 _requestId, bytes16 password
            await contract.methods.openBinding(
                4, 2,
                this.convertStringToBytes('123123', 16),
            ).send({from: accounts[0]}).then((result) => {
                alert(result)
            });
        } catch (err) {
            this.handelError(err.message)
        }
    }
    cancelBinding = async () => {
        const {accounts, contract} = this.state;

        try {//uint64 _bindingId, uint64 _requestId, bytes16 password
            await contract.methods.cancelBinding(
                4,
                this.convertStringToBytes('123123', 16),
            ).send({from: accounts[0]}).then((result) => {
                alert(result)
            });
        } catch (err) {
            this.handelError(err.message)
        }
    }
    createNewBinding = async (event) => {
        const {accounts, contract} = this.state;
        let details = [this.convertStringToBytes('price', 16)
            , this.convertStringToBytes('amount', 16), this.convertStringToBytes('volume', 16)
            , this.convertStringToBytes('total', 16)

        ];
        let points = [1, 3, 6, 3];

        try {
            await contract.methods.createBindingContract(
                this.convertStringToBytes('binding name', 16),
                parseInt(Date.now() / 1000),
                parseInt((Date.now() / 1000)) + 10000,
                details,
                points,
                this.convertStringToBytes('123123', 16)
            ).send({from: accounts[0]}).then((result) => {
            });
        } catch (err) {
            this.handelError(err.message)
        }

    }
// insert , update data in blockchain -- end
// get , select data in blockchain -- start (11)
    loginAsCompany = () => {
        const {accounts, contract} = this.state;

        contract.methods.loginCompany(this.convertStringToBytes('123123', 16)).call({from: accounts[0]}).then(function (count) {
            alert(count)
        });

    }
    loginAsMunicipality = () => {
        const {accounts, contract} = this.state;

        contract.methods.loginMunicipality(this.convertStringToBytes('123123', 16)).call({from: accounts[0]}).then(function (count) {
            alert(count)
        });

    }

    getAllBinding = () => {
        const {accounts, contract, web3} = this.state;
        contract.methods.getBindings(1, '0x0000000000000000000000000000000000000000').call({from: accounts[0]}).then(function (bindings, err) {
            bindings.forEach(function (data) {
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

        });


    }
    getActiveBindingContracts = () => {
        const {accounts, contract, web3} = this.state;

        contract.methods.getBindings(2, '0x0000000000000000000000000000000000000000').call({from: accounts[0]}).then(function (bindings) {
            bindings.forEach(function (data) {
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
                    alert("bindingId: " + bindingId + " ,name: " + name
                        + "startDate: , " + startDate + " , endDate: " + endDate + " , address:  " + address + " , details:" + details + " , points: " + points)
                }


            });
        });

    }
    getEndedBindingContracts = () => {
        const {accounts, contract, web3} = this.state;

        contract.methods.getBindings(3, '0x0000000000000000000000000000000000000000').call({from: accounts[0]}).then(function (binding) {

            binding.forEach(function (data) {
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
                    alert("bindingId: " + bindingId + " ,name: " + name
                        + "startDate: , " + startDate + " , endDate: " + endDate + " , address:  " + address + " , details:" + details + " , points: " + points)
                }


            });
        });

    }
    getOpenedBindingContracts = () => {
        const {accounts, contract, web3} = this.state;

        contract.methods.getBindings(4, '0x0000000000000000000000000000000000000000').call({from: accounts[0]}).then(function (bindings) {
            bindings.forEach(function (data) {
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
                    alert("bindingId: " + bindingId + " ,name: " + name
                        + "startDate: , " + startDate + " , endDate: " + endDate + " , address:  " + address + " , details:" + details + " , points: " + points)
                }

            });

        });


    }
    getCanceledBindingContracts = () => {
        const {accounts, contract, web3} = this.state;

        contract.methods.getBindings(5, '0x0000000000000000000000000000000000000000').call({from: accounts[0]}).then(function (bindings) {
            bindings.forEach(function (data) {
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
                    alert("bindingId: " + bindingId + " ,name: " + name
                        + "startDate: , " + startDate + " , endDate: " + endDate + " , address:  " + address + " , details:" + details + " , points: " + points)
                }

            });

        });

    }

    getMunicipalityActiveBindingContracts = () => {
        const {accounts, contract, web3} = this.state;

        contract.methods.getBindings(2, accounts[0]).call({from: accounts[0]}).then(function (bindings) {
            bindings.forEach(function (data) {
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
                    alert("bindingId: " + bindingId + " ,name: " + name
                        + "startDate: , " + startDate + " , endDate: " + endDate + " , address:  " + address + " , details:" + details + " , points: " + points)
                }

            });

        });

    }
    getMunicipalityEndedBindingContracts = () => {
        const {accounts, contract, web3} = this.state;

        contract.methods.getBindings(3, accounts[0]).call({from: accounts[0]}).then(function (bindings) {
            bindings.forEach(function (data) {
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
                    alert("bindingId: " + bindingId + " ,name: " + name
                        + "startDate: , " + startDate + " , endDate: " + endDate + " , address:  " + address + " , details:" + details + " , points: " + points)
                }

            });

        });

    }
    getMunicipalityOpenedBindingContracts = () => {
        const {accounts, contract, web3} = this.state;

        contract.methods.getBindings(4, accounts[0]).call({from: accounts[0]}).then(function (bindings) {
            bindings.forEach(function (data) {
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
                    alert("bindingId: " + bindingId + " ,name: " + name
                        + "startDate: , " + startDate + " , endDate: " + endDate + " , address:  " + address + " , details:" + details + " , points: " + points)
                }

            });

        });

    }
    getMunicipalityCanceledBindingContracts = () => {
        const {accounts, contract, web3} = this.state;

        contract.methods.getBindings(4, accounts[0]).call({from: accounts[0]}).then(function (bindings) {
            bindings.forEach(function (data) {
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
                    alert("bindingId: " + bindingId + " ,name: " + name
                        + "startDate: , " + startDate + " , endDate: " + endDate + " , address:  " + address + " , details:" + details + " , points: " + points)
                }

            });

        });

    }
    getMunicipalityBindingContracts = () => {
        const {accounts, contract, web3} = this.state;

        contract.methods.getBindings(1, accounts[0]).call({from: accounts[0]}).then(function (bindings) {
            bindings.forEach(function (data) {
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
                    alert("bindingId: " + bindingId + " ,name: " + name
                        + "startDate: , " + startDate + " , endDate: " + endDate + " , address:  " + address + " , details:" + details + " , points: " + points)
                }

            });

        });

    }


    getCompanyContractsRequest = () => {
        const {accounts, contract} = this.state;

        contract.methods.getContractsRequest(accounts[0], 0).call({from: accounts[0]}).then(function (requestIds) {
            requestIds.forEach(function (data) {


                if (data != null && data[0] > 0) {
                    alert(data)
                }

            });

        });

    }
    getContractsRequestByBindingId = () => {
        const {accounts, contract} = this.state;

        contract.methods.getContractsRequest('0x0000000000000000000000000000000000000000', 2).call({from: accounts[0]}).then(function (requestIds) {

            requestIds.forEach(function (data) {
                if (data != null && data[0] > 0) {
                    alert(data)
                }


            });

        });

    }

// get , select data in blockchain -- end
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
                                <form onSubmit={this.createNewBinding}>
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
                                        onClick={this.signUpMunicipality}>signUpMunicipality
                                </button>


                                <button className="btn btn-primary"
                                        onClick={this.signUpCompany}>signUpCompany
                                </button>


                                <button className="btn btn-primary"
                                        onClick={this.createNewRequestToBinding}>createNewRequestToBinding
                                </button>


                                <button className="btn btn-primary"
                                        onClick={this.openBinding}>openBinding
                                </button>


                                <button className="btn btn-primary"
                                        onClick={this.cancelBinding}>cancelBinding
                                </button>


                                <button className="btn btn-primary"
                                        onClick={this.createNewBinding}>createNewBinding
                                </button>


                                <button className="btn btn-primary"
                                        onClick={this.loginAsCompany}>loginAsCompany
                                </button>

                                <button className="btn btn-primary"
                                        onClick={this.loginAsMunicipality}>loginAsMunicipality
                                </button>

                                <button className="btn btn-primary"
                                        onClick={this.getAllBinding}>getAllBinding
                                </button>

                                <button className="btn btn-primary"
                                        onClick={this.getActiveBindingContracts}>getActiveBindingContracts
                                </button>

                                <button className="btn btn-primary"
                                        onClick={this.getEndedBindingContracts}>getEndedBindingContracts
                                </button>

                                <button className="btn btn-primary"
                                        onClick={this.getOpenedBindingContracts}>getOpenedBindingContracts
                                </button>

                                <button className="btn btn-primary"
                                        onClick={this.getCanceledBindingContracts}>getCanceledBindingContracts
                                </button>

                                <button className="btn btn-primary"
                                        onClick={this.getMunicipalityActiveBindingContracts}>getMunicipalityActiveBindingContracts
                                </button>

                                <button className="btn btn-primary"
                                        onClick={this.getMunicipalityEndedBindingContracts}>getMunicipalityEndedBindingContracts
                                </button>

                                <button className="btn btn-primary"
                                        onClick={this.getMunicipalityOpenedBindingContracts}>getMunicipalityOpenedBindingContracts
                                </button>

                                <button className="btn btn-primary"
                                        onClick={this.getMunicipalityCanceledBindingContracts}>getMunicipalityCanceledBindingContracts
                                </button>

                                <button className="btn btn-primary"
                                        onClick={this.getMunicipalityBindingContracts}>getMunicipalityBindingContracts
                                </button>

                                <button className="btn btn-primary"
                                        onClick={this.getAllRequestBindings}>getAllRequestBindings
                                </button>

                                <button className="btn btn-primary"
                                        onClick={this.getCompanyContractsRequest}>getCompanyContractsRequest
                                </button>

                                <button className="btn btn-primary"
                                        onClick={this.getCompanyContractsRequestCanceled}>getCompanyContractsRequestCanceled
                                </button>

                                <button className="btn btn-primary"
                                        onClick={this.getCompanyContractsRequestOpened}>getCompanyContractsRequestOpened
                                </button>

                                <button className="btn btn-primary"
                                        onClick={this.getCompanyContractsRequestEnded}>getCompanyContractsRequestEnded
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
