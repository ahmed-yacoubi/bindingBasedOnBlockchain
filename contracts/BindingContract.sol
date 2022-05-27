// SPDX-License-Identifier: GPL-3.0
pragma abicoder v2;

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

    struct BindingData {//
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

    function signUpCompany(uint64 _companyId, bytes16 _name, bytes16 _phoneNo, bytes16 _specification, bytes16 _password) public payable {
        require(company[msg.sender].companyId == 0, "already signed");

        company[msg.sender] = Company(_companyId, msg.sender, _name, _phoneNo, _specification, _password);

    }

    function signUpMunicipality(uint64 _municipalityId,
        bytes16 _name,
        bytes16 _phoneNo, bytes16 _password) public payable {
        require(municipality[msg.sender].municipalityId == 0, "already signed");
        municipality[msg.sender] = Municipality(_municipalityId, msg.sender, _name, _phoneNo, _password);

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
            require(!isRepeatedItem(_details, _details[i]), "Repeated details");
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


    function getBindingById(uint64 bindingId)
    public
    view
    returns (BindingData memory)
    {
        require(bindingId <= bindingContractCount, "invalid id");
        return bindingContracts[bindingId];
    }


    function getBindings(uint8 _bidType, address _address) view external returns (BindingData[] memory) {
        BindingData  [] memory _bindings = new BindingData[](bindingContractCount);
        address _deadAddress;
        uint64 counter = 0;
        for (uint64 i = 1; i <= bindingContractCount; i++) {
            if (_bidType == 1) {// get all binding
                if (_address == _deadAddress || _address == bindingContracts[i].municipalityAddress) {
                    _bindings[i - 1] = bindingContracts[i];
                    counter++;
                }
            } else if (_bidType == 2) {// get active binding
                if (isActive(i) && !bindingContracts[i].isCanceled && !bindingContracts[i].isOpened)
                    if (_address == _deadAddress || _address == bindingContracts[i].municipalityAddress) {
                        _bindings[i - 1] = bindingContracts[i];
                        counter++;
                    }
            } else if (_bidType == 3) {// get ended binding
                if (!isActive(i) && !bindingContracts[i].isCanceled && !bindingContracts[i].isOpened)
                    if (_address == _deadAddress || _address == bindingContracts[i].municipalityAddress) {
                        _bindings[i - 1] = bindingContracts[i];
                        counter++;
                    }
            } else if (_bidType == 4) {// get opened binding

                if (!isActive(i) && !bindingContracts[i].isCanceled && bindingContracts[i].isOpened)
                    if (_address == _deadAddress || _address == bindingContracts[i].municipalityAddress) {
                        _bindings[i - 1] = bindingContracts[i];
                        counter++;
                    }
            } else if (_bidType == 5) {// get all binding
                if (bindingContracts[i].isCanceled)
                    if (_address == _deadAddress || _address == bindingContracts[i].municipalityAddress) {
                        _bindings[i - 1] = bindingContracts[i];
                        counter++;}
            }
        }
        BindingData  [] memory _bindings1 = new BindingData[](counter);
        _bindings1 = _bindings;
        delete _bindings;
        return _bindings1;

    }


    function openBinding(uint64 _bindingId, uint64 _requestId, bytes16 password) public payable {
        require(_bindingId <= bindingContractCount && _requestId <= bindingRequestsCount &&
            bindingRequests[_requestId].bindingId == _bindingId, "invalid id");


    require(password == municipality[msg.sender].password, "password not correct");
        require(msg.sender == bindingContracts[_bindingId].municipalityAddress, "you are not owner");
        bindingContracts[_bindingId].isOpened = true;
        bindingContracts[_bindingId]._winnerId = _requestId;
        bindingRequests[_requestId].isWinner = true;

    }


    function cancelBinding(uint64 _bindingId, bytes16 password) public payable returns (bool){require(_bindingId <= bindingContractCount && isActive(_bindingId) && !bindingContracts[_bindingId].isCanceled
    && !bindingContracts[_bindingId].isOpened, "cannot cancel");


        require(password == municipality[msg.sender].password, "password not correct");
        require(msg.sender == bindingContracts[_bindingId].municipalityAddress, "you are not owner");
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

        require(isActive(_bindingId), "binding not active");
        BindingData memory _bindingData = getBindingById(_bindingId);
        bytes16 [] memory _bindingDetails = _bindingData.details;
        require(_details.length <= _bindingDetails.length, "invalid details");
        for (uint256 i = 0; i < _details.length; i++) {
            require(!isRepeatedItem(_details, _details[i]) && searchInArray(_bindingDetails, _details[i]), "invalid in details");
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
        require(_requestId <= bindingRequestsCount, "invalid id");
        return bindingRequests[_requestId];
    }

    function getContractsRequest(address _companyAddress, uint64 _bindingId) public view
    returns (RequestBinding [] memory)
    {
        RequestBinding [] memory _contractRequests = new RequestBinding[](bindingRequestsCount);
        uint64 counter = 0;
        address _deadAddress;
        for (uint64 i = 1; i <= bindingRequestsCount; i++) {
            if (_companyAddress != _deadAddress && _bindingId == 0 && bindingRequests[i].companyAddress == _companyAddress) {
                _contractRequests[i - 1] = bindingRequests[i];
                counter++;
            } else if (_companyAddress == _deadAddress && _bindingId != 0 && bindingRequests[i].bindingId == _bindingId) {
                _contractRequests[i - 1] = bindingRequests[i];
                counter++;
            }
        }
        RequestBinding [] memory _contractRequests1 = new RequestBinding[](counter);
        _contractRequests1 = _contractRequests;
        delete _contractRequests;
        return _contractRequests1;
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
