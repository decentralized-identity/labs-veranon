//SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {ISemaphoreVerifier} from "@semaphore-protocol/contracts/interfaces/ISemaphoreVerifier.sol";
import {IManager} from "./IManager.sol";

interface IServiceProvider {
    error ServiceProvider__AlreadyRegistered();
    error ServiceProvider__NotRegistered();
    error ServiceProvider__GroupDoesNotExist();
    error ServiceProvider__NullifierAlreadyUsed();
    error ServiceProvider__InvalidProof();
    error ServiceProvider__InvalidTreeRoot();
    error ServiceProvider__InvalidMerkleTreeDepth();
    error ServiceProvider__ManagerNotApproved();

    event ServiceProviderRegistered(uint256 indexed serviceProviderId, address indexed provider);
    event AccountVerified(
        uint256 indexed groupId,
        uint256 indexed merkleTreeDepth,
        uint256 indexed merkleTreeRoot,
        uint256 nullifier,
        uint256 message,
        uint256 scope,
        uint256[8] points
    );

    struct ServiceProviderData {
        bool isRegistered;
        uint256 serviceProviderId;
        mapping(uint256 managerId => bool isApproved) approvedManagers;
    }

    struct SemaphoreProof {
        uint256 merkleTreeDepth;
        uint256 merkleTreeRoot;
        uint256 nullifier;
        uint256 message;
        uint256 scope;
        uint256[8] points;
    }

    function register() external returns (uint256 serviceProviderId);
    function setApprovedManager(uint256 managerId) external;
    function removeApprovedManager(uint256 managerId) external;
    function verifyAccount(uint256 groupId, SemaphoreProof calldata proof) external;

    function verifier() external view returns (ISemaphoreVerifier);
    function manager() external view returns (IManager);
    function serviceProviderCounter() external view returns (uint256);
    function isRegistered(address provider) external view returns (bool);
    function getServiceProviderId(address provider) external view returns (uint256);
    function isApprovedManager(address provider, uint256 managerId) external view returns (bool);
    function isApprovedManagerById(uint256 serviceProviderId, uint256 managerId) external view returns (bool);
    function serviceProviderAddresses(uint256 serviceProviderId) external view returns (address);
    function nullifiers(uint256 groupId, uint256 nullifier) external view returns (bool);
    function verifiedAccounts(uint256 serviceProviderId, uint256 accountId) external view returns (bool);
    function checkProof(uint256 groupId, SemaphoreProof calldata proof) external view returns (bool);
}
