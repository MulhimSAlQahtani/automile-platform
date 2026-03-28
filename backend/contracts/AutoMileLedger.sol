// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title AutoMileLedger
 * @dev Immutable blockchain ledger tracking cryptographic hashes of verified mechanic services.
 * Eradicates odometer rollback fraud and physically forces "Zero-Trust" vehicle valuation.
 */
contract AutoMileLedger {
    
    struct ServiceRecord {
        uint256 timestamp;
        uint256 mileage;
        string mechanicIdentifier; // Authorized Firebase Shop UUID
        string partReplaced;       // e.g. "Timing Belt"
        bytes32 ipfsReceiptHash;   // Cryptographic Proof of the digitized receipt PDF (Zero-Knowledge)
    }

    // Mapping an irreversibly hashed Vehicle Identification Number (VIN) to its array of historical services
    mapping(bytes32 => ServiceRecord[]) private vehicleServiceLedgers;

    // Platform Owner Admin Rights
    address public contractOwner;
    mapping(address => bool) public authorizedNodes;

    event ServiceAppended(bytes32 indexed hashedVin, uint256 mileage, string partReplaced, uint256 timestamp);

    constructor() {
        contractOwner = msg.sender;
        authorizedNodes[msg.sender] = true;
    }

    modifier onlyAuthorized() {
        require(authorizedNodes[msg.sender] == true, "Unauthorized: Sender is not a verified AutoMile Cloud Function Node.");
        _;
    }
    
    modifier onlyOwner() {
        require(msg.sender == contractOwner, "Unauthorized: Strict Admin Only.");
        _;
    }

    /**
     * @dev Grant permission to AutoMile Firebase Backend nodes to mint new records.
     */
    function authorizeBackendNode(address _backendNode) external onlyOwner {
        authorizedNodes[_backendNode] = true;
    }

    /**
     * @dev Mint a new permanent mechanic record attached to the exact cryptographic vehicle identity.
     */
    function mintServiceRecord(
        bytes32 _hashedVin,
        uint256 _mileage,
        string calldata _mechanicId,
        string calldata _part,
        bytes32 _receiptHash
    ) external onlyAuthorized {
        
        // Enforce progressive odometer linearity (Prevents Rollback Fraud)
        if (vehicleServiceLedgers[_hashedVin].length > 0) {
            uint256 lastMileage = vehicleServiceLedgers[_hashedVin][vehicleServiceLedgers[_hashedVin].length - 1].mileage;
            require(_mileage >= lastMileage, "Fraud Alert: Submitted mileage is mathematically lower than historical blockchain ledger.");
        }

        ServiceRecord memory newRecord = ServiceRecord({
            timestamp: block.timestamp,
            mileage: _mileage,
            mechanicIdentifier: _mechanicId,
            partReplaced: _part,
            ipfsReceiptHash: _receiptHash
        });

        vehicleServiceLedgers[_hashedVin].push(newRecord);
        
        emit ServiceAppended(_hashedVin, _mileage, _part, block.timestamp);
    }

    /**
     * @dev Public Verification endpoint for Secondary Market Buyers inspecting a used vehicle.
     */
    function getVehicleHistory(bytes32 _hashedVin) external view returns (ServiceRecord[] memory) {
        return vehicleServiceLedgers[_hashedVin];
    }
}
