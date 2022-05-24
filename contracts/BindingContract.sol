// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;
// bytes8 = 8 char , bytes16 = 16 char , bytes32 = 32 char ...ect
// uint8 = 0-255 ,
// to test new commit
// new

// name
// phoneNo
// id
// address
//
contract BindingContract {

    struct Company {
        uint64 companyId;
        address companyAddress;
        bytes16 name;
        bytes16 phoneNo;
        bytes16 specification;
        bytes16 password;
    }

    struct Municipality {
        uint64 municipalityId;
        address municipalityAddress;
        bytes16 name;
        bytes16 phoneNo;
        bytes16 password;
    }

    struct BindingData {
        uint64 bindingId;
        bytes16 name;
        uint64 startDate;
        uint64 endDate;
        bytes16[] details;
        uint8[] points;
        address municipalityAddress;
        bool isCanceled;
        bool isOpened;
        uint64 _winnerId;
    }

    struct RequestBinding {
        uint64 requestId;
        uint64 companyId;
        bytes16 fullName;
        bytes16 phoneNo;
        uint32 price;
        uint64 bindingId;
        bytes16 [] details;
        address companyAddress;
        bool isWinner;
    }

    //-*-*-*-*--*-*-*-*--*-*-*-*--*-*-*-*--*-*-*-*--*-*-*-*--*-*-*-*--*-*-*-*--*-*-*-*--*-*-*-*--*-*-*-*-

    mapping(address => Company) public company;
    mapping(address => Municipality) public municipality;

    function signUpCompany(uint64 _companyId,
        bytes16 _name,
        bytes16 _phoneNo, bytes16 _specification, bytes16 _password) public  payable returns (bool){
        if (company[msg.sender].companyId == 0) {
            company[msg.sender] = Company(_companyId, msg.sender, _name, _phoneNo, _specification, _password);
            return true;
        }
        return false;
    }

    function signUpMunicipality(uint64 _municipalityId,
        bytes16 _name,
        bytes16 _phoneNo, bytes16 _password) public payable returns (bool){
        if (municipality[msg.sender].municipalityId == 0) {
            municipality[msg.sender] = Municipality(_municipalityId, msg.sender, _name, _phoneNo, _password);
            return true;
        }
        return false;
    }

    function loginCompany(bytes16 password) public view returns (bool){
        if (company[msg.sender].companyId != 0)
        {
            if (company[msg.sender].password == password) {
                return true;
            }

        }
        return false;
    }

    function loginMunicipality(bytes16 password) public view returns (bool){
        if (municipality[msg.sender].municipalityId != 0)
        {
            if (municipality[msg.sender].password == password) {
                return true;
            }

        }
        return false;
    }


    uint64 bindingContractCount;
    uint64 bindingRequestsCount;

    constructor() {
        bindingContractCount = 0;
        bindingRequestsCount = 0;

    }

    mapping(uint64 => BindingData) public bindingContracts;


    function createBindingContract(
        bytes16 _name,
        uint64 _startDate,
        uint64 _endDate,
        bytes16[] memory _details,
        uint8[] memory _points,
        bytes16 password
    ) public payable {
        require(password == municipality[msg.sender].password, "password not correct");
        require(_details.length == _points.length, "points not equal details");
        for (uint256 i = 0; i < _details.length; i++) {
            require(!isRepeatedItem(_details, _details[i]), "There are similar items in details");
        }
        bindingContractCount++;
        bindingContracts[bindingContractCount] = BindingData(
            bindingContractCount,
            _name,
            _startDate,
            _endDate,
            _details,
            _points,
            msg.sender
        , false, false, 0);

    }


    function getBindingContractsCount() public view returns (uint64) {
        return bindingContractCount;
    }

    function getBindingById(uint64 bindingId)
    public
    view
    returns (BindingData memory)
    {
        require(bindingId <= bindingContractCount, "error in binding id");
        return bindingContracts[bindingId];
    }


    function getActiveBindingIds() public view returns (uint64[] memory) {
        uint64 [] memory _bindingIds;
        for (uint64 i = 1; i <= bindingContractCount; i++) {
            if (isActive(i) && !bindingContracts[i].isCanceled && !bindingContracts[i].isOpened) {
                _bindingIds[i - 1] = i;
            }
        }
        return _bindingIds;
    }

    function getEndedBindingIds() public view returns (uint64[] memory) {
        uint64 [] memory _bindingIds;
        for (uint64 i = 1; i <= bindingContractCount; i++) {
            if (!isActive(i) && !bindingContracts[i].isCanceled && !bindingContracts[i].isOpened) {
                _bindingIds[i - 1] = i;
            }
        }
        return _bindingIds;
    }

    function getOpenedBindingIds() public view returns (uint64 [] memory) {
        uint64 [] memory _bindingIds;
        for (uint64 i = 1; i <= bindingContractCount; i++) {
            if (!isActive(i) && !bindingContracts[i].isCanceled && bindingContracts[i].isOpened) {
                _bindingIds[i - 1] = i;
            }
        }
        return _bindingIds;
    }

    function getCanceledBindingIds() public view returns (uint64 [] memory) {
        uint64 [] memory _bindingIds;
        for (uint64 i = 1; i <= bindingContractCount; i++) {
            if (bindingContracts[i].isCanceled) {
                _bindingIds[i - 1] = i;
            }
        }
        return _bindingIds;
    }

    function getMunicipalityBindingIds(address municipalityAddress) public view returns (uint64 [] memory) {
        uint64 [] memory _bindingIds;
        for (uint64 i = 1; i <= bindingContractCount; i++) {
            if (bindingContracts[i].municipalityAddress == municipalityAddress) {
                _bindingIds[i - 1] = i;
            }
        }
        return _bindingIds;
    }


    function openBinding(uint64 _bindingId, uint64 _requestId, bytes16 password) public payable {
        require(password == municipality[msg.sender].password, "password not correct");
        require(_bindingId <= bindingContractCount, "invalid binding id");
        require(_requestId <= bindingContractCount, "invalid request id");
        require(bindingRequests[_requestId].bindingId == _bindingId, "this request id not in this binding ");
        require(msg.sender == bindingContracts[_bindingId].municipalityAddress, "you are not an owner of these binding contract ");
        bindingContracts[_bindingId].isOpened = true;
        bindingContracts[_bindingId]._winnerId = _requestId;
        bindingRequests[_requestId].isWinner = true;

    }


    function cancelBinding(uint64 _bindingId, bytes16 password) public payable returns (bool){
        require(password == municipality[msg.sender].password, "password not correct");
        require(_bindingId <= bindingContractCount, "binding contract not found");
        require(msg.sender == bindingContracts[_bindingId].municipalityAddress, "you are not owner this binding contract");
        require(!bindingContracts[_bindingId].isCanceled, "this binding contract already canceled");
        require(!bindingContracts[_bindingId].isOpened, "this binding contract is opened");
        require(isActive(_bindingId), "this binding contract is ended");
        bindingContracts[_bindingId].isCanceled = true;
        return true;

    }

    function isActive(uint64 bindingId) public view returns (bool) {
        if (bindingId <= bindingContractCount) {
            if (
                bindingContracts[bindingId].endDate >= block.timestamp
                && bindingContracts[bindingId].startDate <= block.timestamp
            ) {
                return true;
            }
        }
        return false;
    }
    //-*-*-*-*--*-*-*-*--*-*-*-*--*-*-*-*--*-*-*-*--*-*-*-*--*-*-*-*--*-*-*-*--*-*-*-*--*-*-*-*--*-*-*-*--*-*-*-*--*-*-*-*--*-*-*-*-


    mapping(uint64 => RequestBinding) public bindingRequests;

    function requestToBinding(
        uint64 _companyId,
        bytes16 _fullName,
        bytes16 _phoneNo,
        uint32 _price,
        uint64 _bindingId,
        bytes16 [] memory _details
    , bytes16 password
    ) public payable {
        require(password == company[msg.sender].password, "password not correct");

        require(isActive(_bindingId), "this binding contract not active or binding id not valid");
        BindingData memory _bindingData = getBindingById(_bindingId);
        bytes16 [] memory _bindingDetails = _bindingData.details;
        require(_details.length <= _bindingDetails.length, "invalid details , too much details ");
        for (uint256 i = 0; i < _details.length; i++) {
            require(searchInArray(_bindingDetails, _details[i]), "invalid in details (details item not found)");
            require(!isRepeatedItem(_details, _details[i]), "invalid in details (repeating element)");
        }

        bindingRequestsCount++;
        bindingRequests[bindingRequestsCount] = RequestBinding(
            bindingRequestsCount,
            _companyId,
            _fullName,
            _phoneNo,
            _price,
            _bindingId,
            _details,
            msg.sender,
            false
        );
    }

    function getBindingRequestByRequestId(uint64 _requestId)
    public
    view
    returns (RequestBinding memory)
    {
        require(_requestId <= bindingRequestsCount, "invalid request id");
        return bindingRequests[_requestId];
    }

    function getCompanyContractsRequestIds(address _companyAddress) public view
    returns (uint64 [] memory)
    {
        uint64 [] memory contractRequestIds;
        for (uint64 i = 1; i <= bindingRequestsCount; i++) {
            if (bindingRequests[i].companyAddress == _companyAddress) {
                contractRequestIds[i - 1] = i;
            }
        }
        return contractRequestIds;
    }

    function getCompanyContractsRequestEndedIds(address _companyAddress) public view
    returns (uint64 [] memory)
    {
        uint64 []memory contractRequestIds;
        for (uint64 i = 1; i <= bindingRequestsCount; i++) {
            if (bindingRequests[i].companyAddress == _companyAddress
                && !isActive(i) && !bindingContracts[bindingRequests[i].bindingId].isOpened
                && !bindingContracts[bindingRequests[i].bindingId].isCanceled) {
                contractRequestIds[i - 1] = i;
            }
        }
        return contractRequestIds;
    }

    function getCompanyContractsRequestOpenedIds(address _companyAddress) public view
    returns (uint64 [] memory)
    {
        uint64 []memory contractRequestIds;
        for (uint64 i = 1; i <= bindingRequestsCount; i++) {
            if (bindingRequests[i].companyAddress == _companyAddress
                && !isActive(i) && bindingContracts[bindingRequests[i].bindingId].isOpened
                && !bindingContracts[bindingRequests[i].bindingId].isCanceled) {
                contractRequestIds[i - 1] = i;
            }
        }
        return contractRequestIds;
    }

    function getCompanyContractsRequestCanceledIds(address _companyAddress) public view
    returns (uint64 [] memory)
    {
        uint64 [] memory contractRequestIds;
        for (uint64 i = 1; i <= bindingRequestsCount; i++) {
            if (bindingRequests[i].companyAddress == _companyAddress
                && !isActive(i)
                && bindingContracts[bindingRequests[i].bindingId].isCanceled) {
                contractRequestIds[i - 1] = i;
            }
        }
        return contractRequestIds;
    }


    function getBindingRequestCount() public view returns (uint64) {
        return bindingRequestsCount;
    }

    function searchInArray(bytes16 [] memory array, bytes16 variable) public pure returns (bool){
        for (uint i = 0; i < array.length; i++) {
            if (array[i] == variable)
                return true;
        }
        return false;
    }

    function isRepeatedItem(bytes16 [] memory array, bytes16 variable) public pure returns (bool){
        uint8 count = 0;
        for (uint i = 0; i < array.length; i++) {
            if (array[i] == variable)
                count++;
            if (count >= 2)
                break;
        }
        if (count == 1)
            return false;
        return true;
    }

}
