// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract KryptoToken is ERC20, Ownable{
    mapping(address => bool) controllers;
    constructor() ERC20("Krypto Punks Token", "KPT"){}

    function mint(address to, uint256 amount) external{
        if (!controllers[msg.sender])
            revert("OnlyControllersCanMint");
        _mint(to, amount);
    }

    function setController(address controller, bool state) external payable onlyOwner{
        controllers[controller] = state;
    }

}