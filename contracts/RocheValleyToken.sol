// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RocheValleyToken is ERC20, ERC20Burnable, Pausable, Ownable {
    // 1 Billion RV Token
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 1e18;

    constructor(address coldWallet) ERC20("Roche Valley", "RV") Ownable(msg.sender) {
        require(coldWallet != address(0), "Invalid cold wallet address");
        _mint(coldWallet, MAX_SUPPLY);
    }

    ///Mint function
    function mint(address to, uint256 amount) external onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        _mint(to, amount);
    }

    // transfer function 
    function transfer(address to, uint256 amount) public override whenNotPaused returns (bool) {
        return super.transfer(to, amount);
    }
    
    //burn tokens function 
    function burn(uint256 value) public override whenNotPaused{
        super.burn(value);
    }

    
    function transferFrom(address from, address to, uint256 amount) public override whenNotPaused returns (bool) {
        return super.transferFrom(from, to, amount);
    }

    //Pause function 
    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function renounceOwnershipPostPresale() external onlyOwner {
        renounceOwnership();
    }

    //Manual ownership transfer
    function transferOwnership(address newOwner) public override onlyOwner {
        _transferOwnership(newOwner);
    }
}


