import { resolve } from "node:path"
import { beforeAll, describe, expect, it } from "vitest"
import type { Web3BaseWalletAccount } from "web3"
import { Web3 } from "web3"
import { IPFSUploadAndRegister } from "../src"

// Make sure your private key doesn't start with 0x in your environment variables
const privateKey = `0x${process.env.PRIVATE_KEY}`

// We're using a timeout of 60s because the IPFS and blockchain operations can be slow.
describe("IPFSUploadAndRegister E2E Tests", () => {
  let web3: Web3
  let account: Web3BaseWalletAccount

  beforeAll(() => {
    web3 = new Web3("https://1rpc.io/sepolia")
    web3.registerPlugin(new IPFSUploadAndRegister())
    const acc = web3.eth.accounts.wallet.add(privateKey).get(0)
    if (!acc) throw new Error("Account not found")
    account = acc
  })

  it("should upload a dummy file and register CID", async () => {
    const filePath = resolve("./test/testfile.txt")
    const result = await web3.IPFSUploadAndRegister.uploadAndStore({ filePath, from: account?.address })
    expect(result.success).toBe(true)
    expect(result.cid.toString()).toBeTypeOf("string")
    expect(result.blockchainState.from.toLowerCase()).toBe(account?.address.toLowerCase())
    expect(result.blockchainState.status).toBe(1n)
  })

  it("should list CIDs for a given address", async () => {
    const cids = await web3.IPFSUploadAndRegister.listCIDs({ address: account?.address })
    const returnValues = cids.map(c => typeof c !== "string" && c.returnValues)
    expect(returnValues.length).toBeGreaterThan(0)
  })
}, 60_000)
