// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

// @creator: Fixfon
// @author:  Fixfon
// https://twitter.com/fixfondev
// https://github.com/fixfon

import "@openzeppelin/contracts/utils/Counters.sol";

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
    using Counters for Counters.Counter;
    struct AuctionItem {
        address payable seller;
        uint256 nftTokenId;
        // mapping(address => uint256) bids;
        address highestBidder;
        uint256 highestBid;
        uint256 startPrice;
        uint256 buyNowPrice;
        uint256 startedAt;
        uint256 endAt;
        bool canceled;
    }

    bool private locked;
    address payable public owner;
    uint256 public ownerCut;
    IERC721 public immutable contractAddress;
    Counters.Counter private _auctionIdCounter;
    mapping(uint256 => AuctionItem) public auctions;
    mapping(uint256 => mapping(address => uint256)) public bidList;

    event AuctionCreated(
        uint256 indexed auctionId,
        address seller,
        uint256 nftTokenId,
        uint256 startPrice,
        uint256 buyNowPrice,
        uint256 startedAt,
        uint256 endAt
    );

    event AuctionBid(uint256 indexed auctionId, address bidder, uint256 bid);

    event AuctionBuyNow(uint256 indexed auctionId, address buyer, uint256 bid);

    event BidderWithdraw(
        uint256 indexed auctionId,
        address bidder,
        uint256 bid
    );

    event AuctionCanceled(
        uint256 indexed auctionId,
        address seller,
        uint256 nftTokenId
    );

    event AuctionEnded(
        uint256 indexed auctionId,
        address winner,
        uint256 amount
    );

    constructor(address _contractAddress) {
        owner = payable(msg.sender);
        ownerCut = 10;
        contractAddress = IERC721(_contractAddress);
        locked = false;
    }

    function getCurrentAuctionId() public view returns (uint256) {
        return _auctionIdCounter.current();
    }

    function getAuction(uint256 _auctionId)
        public
        view
        returns (AuctionItem memory)
    {
        AuctionItem memory _auction = auctions[_auctionId];
        require(_auction.seller != address(0), "Auction does not exist");
        return _auction;
    }

    function getAuctionList() external view returns (AuctionItem[] memory) {
        AuctionItem[] memory _auctionList = new AuctionItem[](
            _auctionIdCounter.current()
        );

        for (uint256 i = 0; i < _auctionIdCounter.current(); i++) {
            _auctionList[i] = auctions[i];
        }

        return _auctionList;
    }

    function createAuction(
        uint256 _nftTokenId,
        uint256 _startPrice,
        uint256 _buyNowPrice
    ) external {
        require(
            _startPrice < _buyNowPrice,
            "Start price must be less than buy now price."
        );
        require(_startPrice > 0, "Start price must be greater than 0.");

        uint256 auctionId = _auctionIdCounter.current();
        _auctionIdCounter.increment();

        contractAddress.transferFrom(msg.sender, address(this), _nftTokenId);

        auctions[auctionId] = AuctionItem(
            payable(msg.sender),
            _nftTokenId,
            address(0),
            0,
            _startPrice,
            _buyNowPrice,
            block.timestamp,
            block.timestamp + 7 days,
            false
        );

        emit AuctionCreated(
            auctionId,
            msg.sender,
            _nftTokenId,
            _startPrice,
            _buyNowPrice,
            block.timestamp,
            block.timestamp + 7 days
        );
    }

    function endAuction(uint256 _auctionId) public noRentry {
        require(
            getAuction(_auctionId).seller != address(0),
            "Auction does not exist"
        );
        AuctionItem storage _auction = auctions[_auctionId];

        if (_auction.highestBid == _auction.buyNowPrice) {
            _auction.endAt = block.timestamp;
        } else {
            require(
                msg.sender == _auction.seller,
                "You are not the seller of this auction."
            );
            require(
                block.timestamp > _auction.endAt,
                "Auction has not ended yet. To cancel the auction, use cancelAuction function."
            );
        }

        uint256 _amount = _auction.highestBid;
        uint256 _sellerCut = (_amount * (100 - ownerCut)) / 100;
        if (_auction.highestBidder != address(0)) {
            contractAddress.safeTransferFrom(
                address(this),
                _auction.highestBidder,
                _auction.nftTokenId
            );
            payable(_auction.seller).transfer(_sellerCut);
        } else {
            contractAddress.safeTransferFrom(
                address(this),
                _auction.seller,
                _auction.nftTokenId
            );
        }

        emit AuctionEnded(_auctionId, _auction.highestBidder, _amount);
    }

    function bid(uint256 _auctionId)
        external
        payable
        checkEnded(_auctionId)
        checkNotStarted(_auctionId)
    {
        require(
            getAuction(_auctionId).seller != address(0),
            "Auction does not exist"
        );
        AuctionItem storage _auction = auctions[_auctionId];

        require(
            msg.value > _auction.highestBid,
            "There is already a higher bid."
        );
        require(
            msg.value >= _auction.startPrice,
            "Bid amount must be greater than start price."
        );
        require(
            msg.sender != _auction.seller,
            "You cannot bid on your own auction."
        );
        require(msg.value < _auction.buyNowPrice, "Buy now price reached.");

        if (_auction.highestBidder != address(0)) {
            bidList[_auctionId][_auction.highestBidder] += _auction.highestBid;
        }

        _auction.highestBidder = msg.sender;
        _auction.highestBid = msg.value;

        emit AuctionBid(_auctionId, msg.sender, msg.value);
    }

    function refundBid(uint256 _auctionId)
        external
        noRentry
        checkNotEnded(_auctionId)
    {
        require(
            getAuction(_auctionId).seller != address(0),
            "Auction does not exist"
        );
        AuctionItem memory _auction = auctions[_auctionId];

        if (_auction.canceled == false) {
            require(
                msg.sender != _auction.highestBidder,
                "You are the highest bidder."
            );
        }

        uint256 _amount = bidList[_auctionId][msg.sender];
        require(_amount > 0, "You have no bid to withdraw.");

        bidList[_auctionId][msg.sender] = 0;

        payable(msg.sender).transfer(_amount);

        emit BidderWithdraw(_auctionId, msg.sender, _amount);
    }

    function buyNow(uint256 _auctionId)
        external
        payable
        checkEnded(_auctionId)
        checkNotStarted(_auctionId)
    {
        require(
            getAuction(_auctionId).seller != address(0),
            "Auction does not exist"
        );
        AuctionItem storage _auction = auctions[_auctionId];

        require(
            msg.sender != _auction.seller,
            "You cannot bid on your own auction."
        );
        require(
            msg.value == _auction.buyNowPrice,
            "Bid amount must equal to buy now price."
        );

        if (_auction.highestBidder != address(0)) {
            bidList[_auctionId][_auction.highestBidder] += _auction.highestBid;
        }

        _auction.highestBidder = msg.sender;
        _auction.highestBid = msg.value;

        emit AuctionBuyNow(_auctionId, msg.sender, msg.value);

        endAuction(_auctionId);
    }

    function cancelAuction(uint256 _auctionId)
        external
        noRentry
        onlyAuctionCreator(_auctionId)
        checkEnded(_auctionId)
        checkNotStarted(_auctionId)
    {
        require(
            getAuction(_auctionId).seller != address(0),
            "Auction does not exist"
        );
        AuctionItem storage _auction = auctions[_auctionId];
        require(
            _auction.canceled == false,
            "Auction has already been canceled."
        );

        _auction.canceled = true;
        bidList[_auctionId][_auction.highestBidder] += _auction.highestBid;
        _auction.highestBidder = address(0);
        _auction.highestBid = 0;

        contractAddress.safeTransferFrom(
            address(this),
            _auction.seller,
            _auction.nftTokenId
        );

        emit AuctionCanceled(_auctionId, _auction.seller, _auction.nftTokenId);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "You are not the owner.");
        _;
    }

    modifier noRentry() {
        require(!locked, "No rentry allowed");
        locked = true;
        _;
        locked = false;
    }

    modifier checkNotStarted(uint256 _auctionId) {
        AuctionItem memory _auction = auctions[_auctionId];
        require(
            block.timestamp > _auction.startedAt,
            "Auction has not started yet."
        );
        _;
    }

    modifier checkNotEnded(uint256 _auctionId) {
        AuctionItem memory _auction = auctions[_auctionId];
        require(
            (block.timestamp > _auction.endAt) || (_auction.canceled == true),
            "Auction has not ended yet."
        );
        _;
    }

    modifier checkEnded(uint256 _auctionId) {
        AuctionItem memory _auction = auctions[_auctionId];
        require(
            (block.timestamp < _auction.endAt) || (_auction.canceled == false),
            "Auction has already ended."
        );
        _;
    }

    modifier onlyAuctionCreator(uint256 _auctionId) {
        AuctionItem memory _auction = auctions[_auctionId];
        require(
            msg.sender == _auction.seller,
            "You are not the seller of this auction."
        );
        _;
    }
}
