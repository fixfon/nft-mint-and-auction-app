// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

// @creator: Fixfon
// @author:  Fixfon
// https://twitter.com/fixfondev
// https://github.com/fixfon

interface IERC721 {
    function tokenURI() external view returns (string memory);

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) external;

    function transferFrom(
        address,
        address,
        uint256
    ) external;
}

contract Auction {
    struct AuctionItem {
        address payable seller;
        uint256 tokenId;
        uint256 startPrice;
        uint256 endPrice;
        uint256 duration;
        uint256 startedAt;
        uint256 endAt;
        bool ended;
    }
}
