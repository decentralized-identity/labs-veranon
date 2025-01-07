//SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

interface IManager {
    struct ManagerData {
        bool isRegistered;
        uint256 groupId;
    }

    error Manager__AlreadyRegistered();

    event ManagerRegistered(address indexed manager, uint256 indexed groupId);

    function groupCounter() external view returns (uint256);
    function getGroupManager(uint256 groupId) external view returns (address);
    function managers(address manager) external view returns (ManagerData memory);
    function getMerkleTreeRoot(uint256 groupId) external view returns (uint256);

    function register() external returns (uint256 groupId);
    function updateGroupManager(uint256 groupId, address newManager) external;
    function acceptGroupManager(uint256 groupId) external;
    function addMember(uint256 groupId, uint256 identityCommitment) external;
    function addMembers(uint256 groupId, uint256[] calldata identityCommitments) external;
    function updateMember(
        uint256 groupId,
        uint256 oldIdentityCommitment,
        uint256 newIdentityCommitment,
        uint256[] calldata merkleProofSiblings
    ) external;
    function removeMember(
        uint256 groupId,
        uint256 identityCommitment,
        uint256[] calldata merkleProofSiblings
    ) external;

}
