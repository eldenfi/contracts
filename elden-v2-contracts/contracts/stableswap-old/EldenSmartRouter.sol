// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

import "./interfaces/IStableSwap.sol";
import "./interfaces/IStableSwapFactory.sol";
import "./interfaces/IEldenFactory.sol";
import "./interfaces/IWETH02.sol";
import "./libraries/UniERC20.sol";
import "./libraries/SafeERC20.sol";
import "./libraries/EldenExchangeLib.sol";

contract EldenSmartRouter is Ownable, ReentrancyGuard {
    using UniERC20 for IERC20;
    using SafeERC20 for IERC20;
    using EldenExchangeLib for IEldenExchange;

    enum FLAG {
        STABLE_SWAP,
        V2_EXACT_IN
    }

    IWETH02 public immutable weth;
    address public immutable eldenFactory;
    address public stableswapFactory;

    event NewStableSwapFactory(address indexed sender, address indexed factory);
    event SwapMulti(address indexed sender, address indexed srcTokenAddr, address indexed dstTokenAddr, uint256 srcAmount);
    event Swap(address indexed sender, address indexed srcTokenAddr, address indexed dstTokenAddr, uint256 srcAmount);

    fallback() external {}

    receive() external payable {}

    /*
     * @notice Constructor
     * @param _WETHAddress: address of the WETH contract
     * @param _EldenFactory: address of the EldenFactory
     * @param _stableswapFactory: address of the EldenStableSwapFactory
     */
    constructor(
        address _WETHAddress,
        address _eldenFactory,
        address _stableswapFactory
    ) {
        weth = IWETH02(_WETHAddress);
        eldenFactory = _eldenFactory;
        stableswapFactory = _stableswapFactory;
    }

    /**
     * @notice Sets treasury address
     * @dev Only callable by the contract owner.
     */
    function setStableSwapFactory(address _factory) external onlyOwner {
        require(_factory != address(0), "StableSwap factory cannot be zero address");
        stableswapFactory = _factory;
        emit NewStableSwapFactory(msg.sender, stableswapFactory);
    }

    function swapMulti(
        IERC20[] calldata tokens,
        uint256 amount,
        uint256 minReturn,
        FLAG[] calldata flags
    ) public payable nonReentrant returns (uint256 returnAmount) {
        require(tokens.length == flags.length + 1, "swapMulti: wrong length");

        IERC20 srcToken = tokens[0];
        IERC20 dstToken = tokens[tokens.length - 1];

        if (srcToken == dstToken) {
            return amount;
        }

        srcToken.uniTransferFrom(payable(msg.sender), address(this), amount);
        uint256 receivedAmount = srcToken.uniBalanceOf(address(this));

        for (uint256 i = 1; i < tokens.length; i++) {
            if (tokens[i - 1] == tokens[i]) {
                continue;
            }

            if (flags[i - 1] == FLAG.STABLE_SWAP) {
                _swapOnStableSwap(tokens[i - 1], tokens[i], tokens[i - 1].uniBalanceOf(address(this)));
            } else if (flags[i - 1] == FLAG.V2_EXACT_IN) {
                _swapOnV2ExactIn(tokens[i - 1], tokens[i], tokens[i - 1].uniBalanceOf(address(this)));
            }
        }

        returnAmount = dstToken.uniBalanceOf(address(this));
        require(returnAmount >= minReturn, "swapMulti: return amount is less than minReturn");
        uint256 inRefund = srcToken.uniBalanceOf(address(this));
        emit SwapMulti(msg.sender, address(srcToken), address(dstToken), receivedAmount - inRefund);

        uint256 userBalanceBefore = dstToken.uniBalanceOf(msg.sender);
        dstToken.uniTransfer(payable(msg.sender), returnAmount);
        require(dstToken.uniBalanceOf(msg.sender) - userBalanceBefore >= minReturn, "swapMulti: incorrect user balance");

        srcToken.uniTransfer(payable(msg.sender), inRefund);
    }

    function swap(
        IERC20 srcToken,
        IERC20 dstToken,
        uint256 amount,
        uint256 minReturn,
        FLAG flag
    ) public payable nonReentrant returns (uint256 returnAmount) {
        if (srcToken == dstToken) {
            return amount;
        }

        srcToken.uniTransferFrom(payable(msg.sender), address(this), amount);
        uint256 receivedAmount = srcToken.uniBalanceOf(address(this));

        if (flag == FLAG.STABLE_SWAP) {
            require(msg.value == 0, "swap: wrong input msg.value");
            _swapOnStableSwap(srcToken, dstToken, receivedAmount);
        } else if (flag == FLAG.V2_EXACT_IN) {
            _swapOnV2ExactIn(srcToken, dstToken, receivedAmount);
        }

        returnAmount = dstToken.uniBalanceOf(address(this));
        require(returnAmount >= minReturn, "swap: return amount is less than minReturn");
        uint256 inRefund = srcToken.uniBalanceOf(address(this));
        emit Swap(msg.sender, address(srcToken), address(dstToken), receivedAmount - inRefund);

        uint256 userBalanceBefore = dstToken.uniBalanceOf(msg.sender);
        dstToken.uniTransfer(payable(msg.sender), returnAmount);
        require(dstToken.uniBalanceOf(msg.sender) - userBalanceBefore >= minReturn, "swap: incorrect user balance");

        srcToken.uniTransfer(payable(msg.sender), inRefund);
    }

    // Swap helpers

    function _swapOnStableSwap(
        IERC20 srcToken,
        IERC20 dstToken,
        uint256 amount
    ) internal {
        require(stableswapFactory != address(0), "StableSwap factory cannot be zero address");
        IStableSwapFactory.StableSwapPairInfo memory info = IStableSwapFactory(stableswapFactory).getPairInfo(
            address(srcToken),
            address(dstToken)
        );
        if (info.swapContract == address(0)) {
            return;
        }

        IStableSwap stableSwap = IStableSwap(info.swapContract);
        IERC20[] memory tokens = new IERC20[](2);
        tokens[0] = IERC20(stableSwap.coins(uint256(0)));
        tokens[1] = IERC20(stableSwap.coins(uint256(1)));
        uint256 i = (srcToken == tokens[0] ? 1 : 0) + (srcToken == tokens[1] ? 2 : 0);
        uint256 j = (dstToken == tokens[0] ? 1 : 0) + (dstToken == tokens[1] ? 2 : 0);
        srcToken.uniApprove(address(stableSwap), amount);
        stableSwap.exchange(i - 1, j - 1, amount, 0);
    }

    function _swapOnV2ExactIn(
        IERC20 srcToken,
        IERC20 dstToken,
        uint256 amount
    ) internal returns (uint256 returnAmount) {
        if (srcToken.isETH()) {
            weth.deposit{value: amount}();
        }

        IERC20 srcTokenReal = srcToken.isETH() ? weth : srcToken;
        IERC20 dstTokenReal = dstToken.isETH() ? weth : dstToken;
        IEldenExchange exchange = IEldenFactory(eldenFactory).getPair(srcTokenReal, dstTokenReal);

        srcTokenReal.safeTransfer(address(exchange), amount);
        bool needSync;
        (returnAmount, needSync) = exchange.getReturn(srcTokenReal, dstTokenReal, amount);
        if (needSync) {
            exchange.sync();
        }
        if (srcTokenReal < dstTokenReal) {
            exchange.swap(0, returnAmount, address(this), "");
        } else {
            exchange.swap(returnAmount, 0, address(this), "");
        }

        if (dstToken.isETH()) {
            weth.withdraw(weth.balanceOf(address(this)));
        }
    }
}