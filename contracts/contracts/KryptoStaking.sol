// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

interface IKryptoPunckNFT {
    function approve(address to, uint256 tokenId) external;
    function totalSupply() external view returns(uint256); 
    function tokensOfOwner(address _owner)
        external
        view
        returns (uint256[] memory);
    // To call Parent's Contract's override function, at Interface of Child Contract function have to be declared.
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) external;
    function ownerOf(uint256 tokenId) external view returns (address owner);
    function balanceOf(address owner) external view returns (uint256 balance);
}

interface IKryptoPunksToken{
    function mint(address to, uint256 amount) external;
}

contract KryptoVault is IERC721Receiver{
    IKryptoPunksToken immutable token;
    IKryptoPunckNFT immutable nft;
    uint256 private constant MONTH = 30 days;
    uint256 public totalItemsStaked;

    struct Stake{
        address owner;
        uint64  stakingAt;
    }

    mapping(uint256 => Stake) vault;

    constructor(address _nft, address _token){
        token = IKryptoPunksToken(_token);
        nft = IKryptoPunckNFT(_nft);
    }

    function stake(uint256[] calldata tokenIds) external{
        for (uint256 i; i < tokenIds.length; )
        {
            if (nft.ownerOf(tokenIds[i]) != msg.sender)
                revert("Caller is not NFT Owner");
            if (vault[tokenIds[i]].owner != address(0))
                revert("NFT is already staked");
            nft.safeTransferFrom(msg.sender, address(this), tokenIds[i]);
            vault[tokenIds[i]] = Stake(msg.sender, uint64(block.timestamp));

            unchecked {
                ++ i ;
            }
        }
        totalItemsStaked += tokenIds.length;
    }
    function unstake(uint256[] calldata tokenIds) external{
        _claim(msg.sender, tokenIds, true);
    }
    
    function claim(uint256[] calldata tokenIds) external{
        _claim(msg.sender, tokenIds, false);
    }

    function _claim(address user, uint256[] calldata tokenIds, bool unstakeAll) internal {
        uint256 tokenId;
        uint256 rewardEarned;
        uint256 len = tokenIds.length;
        for (uint256 i; i < len;)
        {
            tokenId = tokenIds[i];
            if (vault[tokenId].owner != user)
                revert("user is not Owner");
            uint256 _stakedAt = uint256(vault[tokenId].stakingAt);
            uint256 stakingPeriod = block.timestamp - _stakedAt;
            uint256 dailyReward = _caculateDailyReward(stakingPeriod);
            rewardEarned += (dailyReward * stakingPeriod * 1e18) / 1 days;
            vault[tokenId].stakingAt = uint64(block.timestamp);
            unchecked {
                i ++;
            }
        }
        if (rewardEarned != 0)
            token.mint(user, rewardEarned);

        if (unstakeAll)
            _unstake(user, tokenIds);

    }
    function _unstake(address user, uint256[] calldata tokenIds) internal{
        
        for (uint256 i = 0 ; i < tokenIds.length;)
        {
            uint256 tokenId = tokenIds[i];
            if (user != vault[tokenId].owner)
                revert("user is not owner");
            delete vault[tokenId];
            nft.safeTransferFrom(address(this), user, tokenId);
            unchecked {
                i ++;
            }
        }
        totalItemsStaked -= tokenIds.length;

    }

    function _caculateDailyReward(uint256 periodTime) internal pure returns(uint256 reward){
        if (periodTime < MONTH)
            reward = 1;
        else if (periodTime < 3 * MONTH)
            reward =  2;
        else if (periodTime < 6 * MONTH)
            reward =  4;
        else if (periodTime >= 6 * MONTH)
            reward =  8;
        return reward;
    }
    // function getAddressFromString(string memory str) external pure returns(address addr)
    // {
    //     bytes memory strBytes = bytes(str);
    //     bytes32 hash = keccak256(strBytes);
    //     // Extract the address from the last 20 bytes of the hash
    //     addr = address(uint160(uint256(hash)));
    //     return addr;
    // }
    function getTotalReward(address user) external  view returns(uint256 reward){
        uint256 [] memory tokenIds = tokensOfOwner(user);
        uint256 len = tokenIds.length;
        uint256 tokenId;
        for (uint256 i; i < len;)
        {
            tokenId = tokenIds[i];
            if (vault[tokenId].owner != user)
                revert("user is not Owner");
            uint256 _stakedAt = uint256(vault[tokenId].stakingAt);
            uint256 stakingPeriod = block.timestamp - _stakedAt;
            uint256 dailyReward = _caculateDailyReward(stakingPeriod);
            reward += (dailyReward * stakingPeriod * 1e18) / 1 days;
            unchecked {
                i ++;
            }
        }
        return reward;
    }

    function balanceOf(address user) public view returns(uint256 nStakedbalance){
        uint256 nSupply = nft.totalSupply();
        unchecked {
        for (uint256 i; i <= nSupply; ++i)
        {
            if (vault[i].owner == user)
                nStakedbalance ++;
        }}
    }

    function tokensOfOwner(address user) public view returns(uint256 [] memory tokenIds)
    {
        uint256 balance = balanceOf(user);
        if (balance == 0) return tokenIds;
        uint256 supply = nft.totalSupply();
        uint256 counter;
        tokenIds = new uint256[](balance);
        unchecked{
            for (uint256 i; i <= supply; ++i){
                if (vault[i].owner == user){
                    tokenIds[counter] = i;
                    counter++;
                    if (counter == balance)
                        return tokenIds;
                }      
            }
        }
    }

    function onERC721Received(
        address /**operator*/,
        address /**from*/,
        uint256 /**amount*/,
        bytes calldata //data
    ) external pure override returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }
}
