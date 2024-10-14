// SPDX-License-Identifier: MIT

pragma solidity 0.8.7;
import "erc721a/contracts/extensions/ERC721AQueryable.sol";
import "erc721a/contracts/ERC721A.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract KryptoNFT is ERC721AQueryable, Ownable{
    uint256 public nMaxPerTx;
    uint256 public nCostMint;
    uint256 public immutable nTotalSupply; // immutable variable can change within constructor, not else

    uint256 public paused = 0;
    string  public uriBase;
    string  public constant uriExtension = ".json";

    constructor(uint256 _maxPerTx, uint256 _cost, uint256 _totalsupply) ERC721A("Krypto Punk NFT", "KPN"){
        nMaxPerTx = _maxPerTx;
        nCostMint = _cost;
        nTotalSupply = _totalsupply;
    }

    //Owner function
    function setMaxPerTx(uint256 _maxPX) external payable onlyOwner {nMaxPerTx = _maxPX;}
    function setCost(uint256 _cost) external payable onlyOwner {nCostMint = _cost;}
    function setActive(uint256 _paused) external payable onlyOwner {paused = _paused;}
    function setUriBase(string memory _uriBase) external payable onlyOwner {uriBase = _uriBase;}
    
    function mint(uint256 nAmount) external payable{
        if (paused == 0) {revert("contract is paused");}
        if (nAmount > nMaxPerTx)
            {revert("mintAmount is greater than MaxPerTx");}
        uint256 nSupply = totalSupply();
        if (nSupply + nAmount > nTotalSupply)
            revert("Supply is limited");
        if (msg.sender != owner()){
             if(msg.value < nAmount * nCostMint)
                revert("insufficient gold");
        }
        _safeMint(msg.sender, nAmount);
    }

    function tokenURI(uint256 tokenId) public view virtual override returns(string memory){
        if (!_exists(tokenId)) revert("Non-Existent Token");
        string memory currentTokenUri = uriBase;
        if (bytes(currentTokenUri).length > 0)
            return string(abi.encodePacked(currentTokenUri, Strings.toString(tokenId), uriExtension));
        else
            return "";
    }

    function withdraw() external payable onlyOwner{
        (bool success, ) = payable(owner()).call{value: address(this).balance}("");
        require(success);
    }
    // Owner function()

}
