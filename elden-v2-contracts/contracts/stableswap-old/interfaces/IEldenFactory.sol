// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./IEldenExchange.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IEldenFactory {
    function getPair(IERC20 tokenA, IERC20 tokenB) external view returns (IEldenExchange pair);
}