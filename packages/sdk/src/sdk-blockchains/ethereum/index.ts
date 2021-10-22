import { EthereumWallet } from "@rarible/sdk-wallet"
import { createRaribleSdk } from "@rarible/protocol-ethereum-sdk"
import { IRaribleSdk } from "../../domain"
import { Mint } from "./mint"
import { Sell } from "./sell"
import { Fill } from "./fill"
import { Burn } from "./burn"
import { Transfer } from "./transfer"
import { Bid } from "./bid"

export function createEthereumSdk(wallet: EthereumWallet): IRaribleSdk {
	const sdk = createRaribleSdk(wallet.ethereum, wallet.network)

	return {
		nft: {
			transfer: new Transfer(sdk).transfer,
			mint: new Mint(sdk).prepare,
			burn: new Burn(sdk).burn,
		},
		order: {
			fill: new Fill(sdk, wallet).fill,
			sell: new Sell(sdk, wallet).sell,
			bid: new Bid(sdk, wallet).bid,
		},
	}
}
