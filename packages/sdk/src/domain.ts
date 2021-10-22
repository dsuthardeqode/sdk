import { IMint } from "./nft/mint/domain"
import { ISell } from "./order/sell/domain"
import { IFill } from "./order/fill/domain"
import { ITransfer } from "./nft/transfer/domain"
import { IBid } from "./order/bid/domain"

export interface IRaribleSdk {
	nft: {
		mint: IMint,
		transfer: ITransfer,
	},
	order: {
		sell: ISell,
		fill: IFill,
		bid: IBid,
	}
}
