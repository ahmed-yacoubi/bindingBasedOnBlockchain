// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;
// bytes8 = 8 char , bytes16 = 16 char , bytes32 = 32 char ...ect
// uint8 = 0-255 ,
// to test new commit
// new commit
contract BindingContract {
    struct BindingData {
        uint64 bindingId;
        bytes16 name;
        uint64 startDate;
        uint64 endDate;
        bytes16[] details;
        uint8[] points;
        address municipalityAddress;
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
        uint8[] memory _points
    ) public payable {
        require((_details.length == _points.length), "points not equal details");
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
        );

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


    function getActiveBinding(uint64 bindingId) public view returns (BindingData memory) {
        BindingData memory _bindingData;

        if (isActive(bindingId)) {
            _bindingData = bindingContracts[bindingId];
        }
        return _bindingData;
    }

    function getClosedBinding(uint64 bindingId) public view returns (BindingData memory) {
        BindingData memory _bindingData;
        if (!isActive(bindingId)) {
            _bindingData = bindingContracts[bindingId];
        }
        return _bindingData;
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
    struct RequestBinding {
        uint64 requestId;
        uint64 companyId;
        bytes16 fullName;
        bytes16 phoneNo;
        uint32 price;
        uint64 bindingId;
        bytes16 [] details;
        address companyAddress;
    }


    mapping(uint64 => RequestBinding) public bindingRequests;
    //        uint64 requestId;
    //        uint64 companyId;
    //        bytes16 fullName;
    //        bytes16 phoneNo;
    //        uint32 price;
    //        uint64 bindingId;
    //        bytes16 [] details;
    //        address companyAddress;
    function requestToBinding(
        uint64 _companyId,
        bytes16 _fullName,
        bytes16 _phoneNo,
        uint32 _price,
        uint64 _bindingId,
        bytes16 [] memory _details
    ) public {
        require(isActive(_bindingId), "this binding contract not active or binding id not valid");
        BindingData memory _bindingData = getBindingById(_bindingId);
        bytes16 [] memory _bindingDetails = _bindingData.details;
        require(_details.length <= _bindingDetails.length, "invalid details , too much details ");
        for (uint256 i = 0; i < _details.length; i++) {
            require(searchInArray(_bindingDetails, _details[i]), "invalid in details (details item not found)");
            require(!isRepeatedItem(_details, _details[i]), "invalid in details (repeating element)");
        }

        // تاكد من انه مش مكرر الديتيزل
        bindingRequestsCount++;
        bindingRequests[bindingRequestsCount] = RequestBinding(
            bindingRequestsCount,
            _companyId,
            _fullName,
            _phoneNo,
            _price,
            _bindingId,
            _details,
            msg.sender
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
