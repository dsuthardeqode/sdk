import { Blockchain } from "@rarible/api-client"
import type { UnionAddress } from "@rarible/types"
import { toBigNumber } from "@rarible/types"
import type { MintRequest } from "@rarible/sdk/build/types/nft/mint/mint-request.type"
import type { BlockchainWallet } from "@rarible/sdk-wallet"
import type { RequestCurrency } from "@rarible/sdk/src/common/domain"
import type { OrderRequest } from "@rarible/sdk/src/types/order/common"
import type { OrderUpdateRequest } from "@rarible/sdk/build/types/order/common"
import { delay } from "@rarible/sdk/build/common/retry"
import {
	getEthereumWallet,
	getEthereumWalletBuyer,
	getWalletAddressFull,
} from "../../../common/wallet"
import { createSdk } from "../../../common/create-sdk"
import { mint } from "../../../common/atoms-tests/mint"
import { getCollection } from "../../../common/helpers"
import { bid } from "../../../common/atoms-tests/bid"
import { acceptBid } from "../../../common/atoms-tests/accept-bid"
import { testsConfig } from "../../../common/config"
import { getCurrency } from "../../../common/currency"
import { awaitForOwnershipValue } from "../../../common/api-helpers/ownership-helper"
import { bidUpdate } from "../../../common/atoms-tests/bid-update"

function suites(): {
	blockchain: Blockchain,
	description: string,
	wallets: { seller: BlockchainWallet, buyer: BlockchainWallet },
	collectionId: string,
	mintRequest: (creatorAddress: UnionAddress) => MintRequest,
	currency: string,
	bidRequest: (currency: RequestCurrency) => Promise<OrderRequest>,
	updateBidRequest: OrderUpdateRequest,
}[] {
	return [
		{
			blockchain: Blockchain.ETHEREUM,
			description: "ERC721 <=> ERC20",
			wallets: {
				seller: getEthereumWallet(),
				buyer: getEthereumWalletBuyer(),
			},
			collectionId: testsConfig.variables.ETHEREUM_COLLECTION_ERC_721,
			mintRequest: (creatorAddress: UnionAddress): MintRequest => {
				return {
					uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
					creators: [{
						account: creatorAddress,
						value: 10000,
					}],
					royalties: [],
					lazyMint: false,
					supply: 1,
				}
			},
			currency: "ERC20",
			bidRequest: async (currency: RequestCurrency): Promise<OrderRequest> => {
				return {
					amount: 1,
					price: "0.0000000000000001",
					currency: currency,
				}
			},
			updateBidRequest: {
				price: "0.0000000000000002",
			},
		},
		{
			blockchain: Blockchain.ETHEREUM,
			description: "ERC721_lazy <=> ERC20",
			wallets: {
				seller: getEthereumWallet(),
				buyer: getEthereumWalletBuyer(),
			},
			collectionId: testsConfig.variables.ETHEREUM_COLLECTION_ERC_721,
			mintRequest: (creatorAddress: UnionAddress): MintRequest => {
				return {
					uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
					creators: [{
						account: creatorAddress,
						value: 10000,
					}],
					royalties: [],
					lazyMint: true,
					supply: 1,
				}
			},
			currency: "ERC20",
			bidRequest: async (currency: RequestCurrency): Promise<OrderRequest> => {
				return {
					amount: 1,
					price: "0.0000000000000001",
					currency: currency,
				}
			},
			updateBidRequest: {
				price: "0.0000000000000002",
			},
		},
		{
			blockchain: Blockchain.ETHEREUM,
			description: "ERC1155 <=> ERC20",
			wallets: {
				seller: getEthereumWallet(),
				buyer: getEthereumWalletBuyer(),
			},
			collectionId: testsConfig.variables.ETHEREUM_COLLECTION_ERC_1155,
			mintRequest: (creatorAddress: UnionAddress): MintRequest => {
				return {
					uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
					creators: [{
						account: creatorAddress,
						value: 10000,
					}],
					royalties: [],
					lazyMint: false,
					supply: 20,
				}
			},
			currency: "ERC20",
			bidRequest: async (currency: RequestCurrency): Promise<OrderRequest> => {
				return {
					amount: 5,
					price: "0.0000000000000001",
					currency: currency,
				}
			},
			updateBidRequest: {
				price: "0.0000000000000002",
			},
		},
		{
			blockchain: Blockchain.ETHEREUM,
			description: "ERC1155_lazy <=> ERC20",
			wallets: {
				seller: getEthereumWallet(),
				buyer: getEthereumWalletBuyer(),
			},
			collectionId: testsConfig.variables.ETHEREUM_COLLECTION_ERC_1155,
			mintRequest: (creatorAddress: UnionAddress): MintRequest => {
				return {
					uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
					creators: [{
						account: creatorAddress,
						value: 10000,
					}],
					royalties: [],
					lazyMint: true,
					supply: 20,
				}
			},
			currency: "ERC20",
			bidRequest: async (currency: RequestCurrency): Promise<OrderRequest> => {
				return {
					amount: 5,
					price: "0.0000000000000001",
					currency: currency,
				}
			},
			updateBidRequest: {
				price: "0.0000000000000002",
			},
		},
	]
}

describe.each(suites())("$blockchain mint => bid => bidUpdate => acceptBid", (suite) => {
	const {
		seller: sellerWallet,
		buyer: buyerWallet,
	} = suite.wallets
	const sellerSdk = createSdk(suite.blockchain, sellerWallet)
	const buyerSdk = createSdk(suite.blockchain, buyerWallet)

	test(suite.description, async () => {
		const walletAddressSeller = await getWalletAddressFull(sellerWallet)
		const walletAddressBuyer = await getWalletAddressFull(buyerWallet)

		const collection = await getCollection(sellerSdk, suite.collectionId)

		const { nft } = await mint(sellerSdk, sellerWallet, { collection },
			suite.mintRequest(walletAddressSeller.unionAddress))

		const requestCurrency = await getCurrency(suite.wallets, suite.currency)
		const bidRequest = await suite.bidRequest(requestCurrency)

		const bidOrder = await bid(buyerSdk, buyerWallet, { itemId: nft.id }, bidRequest)

		const order = await bidUpdate(buyerSdk, buyerWallet, { orderId: bidOrder.id }, suite.updateBidRequest)

		await delay(3000)

		await acceptBid(sellerSdk, sellerWallet, { orderId: order.id }, { amount: bidRequest.amount })

		await awaitForOwnershipValue(buyerSdk, nft.id, walletAddressBuyer.address, toBigNumber(String(bidRequest.amount)))
		//toDo add balance verification
	})
})
