# Roche Valley Token Project

Welcome to the official smart contract repository for **Roche Valley**, a next-generation token.

---

## Project Overview

Roche Valley is a token ecosystem designed for maximum transparency, security, and investor protection. The project consists of:

- A mintable, burnable, and pausable BEP-20 token named `RV`.
- A secure, multi-phase presale contract with overflow logic.
- Cold wallet integration for secure fund custody.
- Admin control, investor protection mechanisms.

---

## Token Specification

| Property            | Value                         |
|---------------------|-------------------------------|
| **Name**            | Roche Valley                  |
| **Symbol**          | RV                            |
| **Total Supply**    | 1,000,000,000 RV              |
| **Standard**        | BEP-20 (ERC-20 Compatible)    |
| **Network**         | Binance Smart Chain (BSC)     |
| **Mintable**        |    Yes                        |
| **Burnable**        |    Yes                        |
| **Pausable**        |    Yes                        |


---

## Security Features

- Built using OpenZeppelin and audited libraries.
- Ownership transfer to Roche Valley's cold wallet.
- Manual daily withdrawal function only to a pre defined cold wallet.
- Ownership can be renounced after presale for investor protection.

---


## Cold Wallet Integration

- `setColdWallet()` 
- `lockColdWallet()` 
- `manualWithdrawToColdWallet()`


---

## Admin Functions

- `pause()` and `resume()` – Emergency circuit breakers
- `advancePhaseManually()` – To extend sale manually if soft cap not reached
- `withdraw()` – Allowed only when contract is paused
- `renounceOwnershipPostPresale()` – Final ownership renouncement for decentralization

---

## Deployment

### To deploy to BSC Testnet:

```
npx hardhat run scripts/deploy.js --network bscTestnet
```

### Make sure to set your .env with:

```
PRIVATE_KEY=...
BSCTEST_RPC_URL=...
```
---

## Coming Soon

 frontend with wallet connect & BNB deposit interface.

---

## License

This project is licensed under the MIT License.
