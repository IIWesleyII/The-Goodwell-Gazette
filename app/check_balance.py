from web3 import Web3

ADDRESS = Web3.to_checksum_address("0x4f1ADaAe5fBFE21e152668cC50eeE4a15C0EB042") # agent buyer address

BASE_SEPOLIA_RPC = "https://sepolia.base.org"

# Base Sepolia USDC contract
USDC_ADDRESS = Web3.to_checksum_address("0x036CbD53842c5426634e7929541eC2318f3dCF7e")

ERC20_ABI = [
    {
        "constant": True,
        "inputs": [{"name": "account", "type": "address"}],
        "name": "balanceOf",
        "outputs": [{"name": "", "type": "uint256"}],
        "type": "function",
    },
    {
        "constant": True,
        "inputs": [],
        "name": "decimals",
        "outputs": [{"name": "", "type": "uint8"}],
        "type": "function",
    },
    {
        "constant": True,
        "inputs": [],
        "name": "symbol",
        "outputs": [{"name": "", "type": "string"}],
        "type": "function",
    },
]


def main():
    w3 = Web3(Web3.HTTPProvider(BASE_SEPOLIA_RPC))

    if not w3.is_connected():
        raise RuntimeError("Could not connect to Base Sepolia RPC")

    # ETH balance
    eth_balance_wei = w3.eth.get_balance(ADDRESS)
    eth_balance = w3.from_wei(eth_balance_wei, "ether")

    # USDC balance
    usdc = w3.eth.contract(address=USDC_ADDRESS, abi=ERC20_ABI)

    raw_usdc_balance = usdc.functions.balanceOf(ADDRESS).call()
    usdc_decimals = usdc.functions.decimals().call()
    usdc_symbol = usdc.functions.symbol().call()

    usdc_balance = raw_usdc_balance / (10 ** usdc_decimals)

    print("Address:", ADDRESS)
    print("Network: Base Sepolia")
    print("--------------------------------")
    print("ETH balance:", eth_balance)
    print(f"{usdc_symbol} balance:", usdc_balance)


if __name__ == "__main__":
    main()