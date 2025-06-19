// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";


contract RocheValleyPresale is Ownable, Pausable {
    IERC20 public immutable rvToken;

    address public coldWallet;
    bool public coldWalletLocked = false;

    uint256 public constant PHASE_SIZE = 10_000_000 * 1e18;
    uint256 public constant TOTAL_TOKENS_FOR_SALE = 50_000_000 * 1e18;
    uint256 public tokensSoldTotal;
    uint256 public currentPhaseIndex;

    uint256[] public phasePrices;  
    uint256[] public phaseSoftCaps;  
    uint256[] public phaseBNBRaised; // BNB raised per phase

    event TokensPurchased(address indexed buyer, uint256 tokensBought, uint256 valueBNB);
    event ColdWalletSet(address coldWallet);
    event ColdWalletLocked();
    event ManualWithdrawToColdWallet(uint256 amount);
    event PhaseAdvanced(uint256 newPhaseIndex);

    constructor(
        address _coldWallet,
        address _rvToken,
        uint256[] memory _phasePrices,
        uint256[] memory _phaseSoftCaps
    ) Ownable(msg.sender) {
        require(_coldWallet != address(0), "Invalid cold wallet address");
        require(_rvToken != address(0), "Invalid token address");
        require(_phasePrices.length == 5, "Must provide 5 phase prices");
        require(_phaseSoftCaps.length == 5, "Must provide 5 soft caps");
        
        coldWallet = _coldWallet;
        rvToken = IERC20(_rvToken);
        phasePrices = _phasePrices;
        phaseSoftCaps = _phaseSoftCaps;
        phaseBNBRaised = new uint256[](_phasePrices.length);
    }

    receive() external payable {
        buyTokens();
    }

    function buyTokens() public payable whenNotPaused {
        require(msg.value > 0, "Send BNB to buy tokens");
        require(tokensSoldTotal < TOTAL_TOKENS_FOR_SALE, "Presale ended");
        require(currentPhaseIndex < 5, "All phases completed");

        uint256 remainingBNB = msg.value;
        uint256 tokensToBuy = 0;
        uint256 bnbUsed = 0;

        while (remainingBNB > 0 && currentPhaseIndex < 5) {
            uint256 tokensLeftInPhase = PHASE_SIZE - (tokensSoldTotal % PHASE_SIZE);
            uint256 tokenPrice = phasePrices[currentPhaseIndex];

            uint256 maxTokensThisPhase = (remainingBNB * 1e18) / tokenPrice;

            if (maxTokensThisPhase <= tokensLeftInPhase) {
                uint256 cost = (maxTokensThisPhase * tokenPrice) / 1e18;

                tokensToBuy += maxTokensThisPhase;
                bnbUsed += cost;
                tokensSoldTotal += maxTokensThisPhase;
                phaseBNBRaised[currentPhaseIndex] += cost;

                break; // phase not fully consumed — stay in current phase
            } else {
                uint256 cost = (tokensLeftInPhase * tokenPrice) / 1e18;

                tokensToBuy += tokensLeftInPhase;
                bnbUsed += cost;
                remainingBNB -= cost;
                tokensSoldTotal += tokensLeftInPhase;
                phaseBNBRaised[currentPhaseIndex] += cost;

                currentPhaseIndex++; // move to next phase
            }
        }

        require(tokensToBuy > 0, "No tokens to buy");
        require(rvToken.transfer(msg.sender, tokensToBuy), "Token transfer failed");

        emit TokensPurchased(msg.sender, tokensToBuy, bnbUsed);

        // Refund extra BNB
        if (msg.value > bnbUsed) {
            payable(msg.sender).transfer(msg.value - bnbUsed);
        }
    }

    function tokensSold() external view returns (uint256) {
        return tokensSoldTotal;
    }

    //Cold Wallet Security 

    function setColdWallet(address _coldWallet) external onlyOwner {
        require(!coldWalletLocked, "Cold wallet is locked");
        require(_coldWallet != address(0), "Invalid address");
        coldWallet = _coldWallet;
        emit ColdWalletSet(_coldWallet);
    }

    function lockColdWallet() external onlyOwner {
        require(!coldWalletLocked, "Cold wallet Already locked");
        coldWalletLocked = true;
        emit ColdWalletLocked();
    }

    function manualWithdrawToColdWallet() external onlyOwner {
        require(coldWalletLocked, "Cold wallet not locked");
        uint256 bal = address(this).balance;
        require(bal > 0, "No BNB to withdraw");
        (bool sent, ) = payable(coldWallet).call{value: bal}("");
        require(sent, "Withdraw failed");
        emit ManualWithdrawToColdWallet(bal);
    }


    function isCurrentPhaseSoftCapReached() public view returns (bool) {
        return phaseBNBRaised[currentPhaseIndex] >= phaseSoftCaps[currentPhaseIndex];
    }

    function getPhaseRaised(uint256 phase) external view returns (uint256) {
        require(phase < 5, "Invalid phase");
        return phaseBNBRaised[phase];
    }

    function advancePhaseManually() external onlyOwner {
        require(currentPhaseIndex < 4, "Already in final phase");
        currentPhaseIndex++;
        emit PhaseAdvanced(currentPhaseIndex);
    }

    //Optional Withdraw when paused
    function withdraw() external onlyOwner {
        require(paused(), "Must pause before withdrawing");
        uint256 bal = address(this).balance;
        require(bal > 0, "No BNB to withdraw");
        (bool sent, ) = payable(owner()).call{value: bal}("");
        require(sent, "Withdraw failed");
    }

    //Admin Controls

    function pause() external onlyOwner {
        _pause();
    }

    function resume() external onlyOwner {
        _unpause();
    }
}


