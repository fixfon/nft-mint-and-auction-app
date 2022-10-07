// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

// @creator: Fixfon
// @author:  Fixfon
// https://twitter.com/fixfondev
// https://github.com/fixfon

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract PatikaBears is ERC721, ERC721Enumerable, Pausable, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    string BASE_URI = "ipfs://QmcdPgTijqLUttbAQZzxe4ztQ9saoWCwQ5sEbzpqTG8sFh/";
    uint256 public mintPrice;
    uint256 public maxSupply;
    uint256 public maxPerWallet;
    bool public saleIsActive;
    address payable public withdrawWallet;

    constructor() ERC721("Patika Bears", "PBEAR") {
        mintPrice = 0.02 ether;
        maxSupply = 20;
        maxPerWallet = 5;
        saleIsActive = false;
        withdrawWallet = payable(msg.sender);
        _tokenIdCounter.increment();
    }

    function toggleIsPublicMintEnabled() public onlyOwner {
        saleIsActive = !saleIsActive;
    }

    function setBaseURI(string memory newUri) public onlyOwner {
        BASE_URI = newUri;
    }

    function _baseURI() internal view override returns (string memory) {
        return BASE_URI;
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override
        returns (string memory)
    {
        require(_exists(tokenId), "Token does not exist!");

        string memory baseURI = _baseURI();
        return
            bytes(baseURI).length > 0
                ? string(
                    abi.encodePacked(
                        baseURI,
                        Strings.toString(tokenId),
                        ".json"
                    )
                )
                : "";
    }

    function publicSafeMint() public payable {
        require(saleIsActive, "Sale must be active to mint");
        require(totalSupply() <= maxSupply, "Sold out");
        require(msg.value == mintPrice, "Incorrect value");
        require(balanceOf(msg.sender) < maxPerWallet, "Exeeced max per wallet");

        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(msg.sender, tokenId);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override(ERC721, ERC721Enumerable) whenNotPaused {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        (bool success, ) = withdrawWallet.call{value: balance}("");
        require(success, "Transfer failed.");
    }

    // The following functions are overrides required by Solidity.

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
