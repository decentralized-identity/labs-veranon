//SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

interface IManager {
    error Manager__AlreadyRegistered();
    error Manager__NotRegistered();

    event ManagerRegistered(address indexed manager, uint256 indexed groupId);
    event RegistrationFeeUpdated(uint256 indexed groupId, uint256 fee);

    function groupCounter() external view returns (uint256);
    function getGroupManager(uint256 groupId) external view returns (address);
    function getManagerGroupId(address manager) external view returns (uint256);
    function getMerkleTreeRoot(uint256 groupId) external view returns (uint256);
    function getRegistrationFee(uint256 groupId) external view returns (uint256);

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
