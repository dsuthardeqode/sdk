// @ts-nocheck
// eslint-disable
// This file is generated by create-validator-ts
import Ajv from "ajv"
import * as apiTypes from "./prepare-mint-request.type"

export const SCHEMA = {
	"$schema": "http://json-schema.org/draft-07/schema#",
	"$ref": "#/definitions/PrepareMintRequest",
	"definitions": {
		"PrepareMintRequest": {
			"type": "object",
			"properties": {
				"collection": {
					"$ref": "#/definitions/Collection",
				},
			},
			"required": [
				"collection",
			],
			"additionalProperties": false,
		},
		"Collection": {
			"type": "object",
			"properties": {
				"id": {
					"$ref": "#/definitions/UnionAddress",
				},
				"type": {
					"$ref": "#/definitions/Collection_Type",
				},
				"name": {
					"type": "string",
				},
				"symbol": {
					"type": "string",
				},
				"owner": {
					"$ref": "#/definitions/UnionAddress",
				},
				"features": {
					"type": "array",
					"items": {
						"$ref": "#/definitions/Collection_Features",
					},
				},
			},
			"required": [
				"id",
				"type",
				"name",
				"features",
			],
			"additionalProperties": false,
		},
		"UnionAddress": {
			"type": "string",
		},
		"Collection_Type": {
			"type": "string",
			"enum": [
				"CRYPTO_PUNKS",
				"ERC721",
				"ERC1155",
				"FLOW",
			],
		},
		"Collection_Features": {
			"type": "string",
			"enum": [
				"APPROVE_FOR_ALL",
				"SET_URI_PREFIX",
				"BURN",
				"MINT_WITH_ADDRESS",
				"SECONDARY_SALE_FEES",
				"MINT_AND_TRANSFER",
			],
		},
	},
}
const ajv = new Ajv({ removeAdditional: true }).addSchema(SCHEMA, "SCHEMA")
export function validatePrepareMintRequest(payload: unknown): apiTypes.PrepareMintRequest {
	if (!isPrepareMintRequest(payload)) {
		const error = new Error("invalid payload: PrepareMintRequest")
		error.name = "ValidationError"
		throw error
	}
	return payload
}

export function isPrepareMintRequest(payload: unknown): payload is apiTypes.PrepareMintRequest {
	/** Schema is defined in {@link SCHEMA.definitions.PrepareMintRequest } **/
	const ajvValidate = ajv.compile({ "$ref": "SCHEMA#/definitions/PrepareMintRequest" })
	return ajvValidate(payload)
}
