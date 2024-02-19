// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

//this is the user wallet contract
contract smartWallet{
    address public owner;
    constructor(address _owner){
        owner = _owner;
    }

    receive() external payable { }

    //get eth in wallet
    function transferToContract(address _contractAddress, uint256 _amount) public payable {
        require(msg.value >= _amount, "Sent amount doesn't match the specified amount");
        (bool success, ) = _contractAddress.call{value: _amount}("");
        require(success, "Transfer failed");
    }

    // transfer Eth from wallet
    function transfer(address payable _to, uint256 _amount) public {
        require(msg.sender == owner, "Only the owner can transfer Ether");
        require(getBalance() == _amount,"Insufficent Funds.");
        _to.transfer(_amount);
    }

    // Function to get the balance of a contract
    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

}

//this is the wallet factory contract
contract WalletFactory{
    mapping (address => address) walletsAddress;
    mapping (address => bool) public isWalletActive;

    receive() external payable { }

    function createWallet() public returns(address){
        require(isWalletActive[msg.sender]==false,"Already wallet is created");
        smartWallet newsmartWallet = new smartWallet(msg.sender);
        walletsAddress[msg.sender] = address(newsmartWallet);
        isWalletActive[msg.sender] = true;
        return address(newsmartWallet);
    }

    //user get there wallet address
    function getMyWallet()public view returns(address){
        if(isWalletActive[msg.sender] == true){
            return walletsAddress[msg.sender];
        }else{
            return address(0);
        }
    }

    // Function to get the balance of a contract
    function getBalance(address _contractAddress) public view returns (uint256) {
        if(isWalletActive[msg.sender]==true){
            return _contractAddress.balance;
        }else{
            return 404;         // wallet is not avaliable
        }
        
    }

    function deleteWallet() public{
        require(walletsAddress[msg.sender] != address(0), "Wallet is not active");
        walletsAddress[msg.sender] = address(0); // Set the wallet address to the zero address
        isWalletActive[msg.sender] = false;
    }

}