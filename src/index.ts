import { type Helia, createHelia } from "helia"
import type { AddOptions, UnixFS } from "@helia/unixfs"
import { unixfs } from "@helia/unixfs"
import type { EventLog, TransactionReceipt } from "web3"
import { Contract, Web3PluginBase, validator } from "web3"
import { abi } from "./cidStoreAbi"

const isNode = typeof window === "undefined"

type CID = Awaited<ReturnType<UnixFS["addByteStream"]>>
type CIDStoreContract = Contract<typeof abi>

export class IPFSUploadAndRegister extends Web3PluginBase {
  pluginNamespace = "IPFSUploadAndRegister"

  #helia: Helia | null = null
  #CIDStoreAddress: string = "0xA683BF985BC560c5dc99e8F33f3340d1e53736EB"
  #fs: UnixFS | null = null

  #CIDStore: CIDStoreContract | null = null

  /**
   * When initialized with a custom Helia instance, the plugin will use it to create a unixfs instance.
   * Otherwise, a default Helia instance will be created.
   * A custom CIDStoreAddress can be provided as well. By default the Sepolia ETH testnet will be used.
   */
  public constructor(helia?: Helia, CIDStoreAddress?: string) {
    super()
    if (helia) this.#helia = helia
    if (CIDStoreAddress) this.#CIDStoreAddress = CIDStoreAddress
  }

  /**
   * Upload a file to IPFS and store the resulting CID on the blockchain.
   * Accepts either a file or a filePath, a from address and IPFS Helia Unixfs options.
   */
  public async uploadAndStore({ file, filePath, from, options }: { file?: File; filePath?: string; from?: string; options?: Partial<AddOptions> }):
  Promise<{ success: true; cid: CID; blockchainState: TransactionReceipt }> {
    if (from && !validator.isAddress(from)) throw new Error(`Provided address "${from}" is not Ethereum-compatible.`)
    if (!filePath && !file) throw new Error("Provide either a filePath or a file.")
    if (filePath && file) throw new Error("filePath and file can't be provided simultaneously.")
    if (!isNode && !file) throw new Error("File must be provided when running in a browser environment.")

    // 1. upload file to IPFS
    const cid = isNode && filePath
      ? await this.nodeJsUploadFile({ filePath, options })
      : file && await this.browserUploadFile({ file, options })

    if (!cid) throw new Error("CID not found.")

    // 2. store CID on blockchain
    const blockchainState = await this.storeCID({ cid: cid.toString(), from })
    return { success: true, cid, blockchainState }
  }

  /**
   * List all CIDs stored on the blockchain for a given address.
   * Print all events to the console and return them.
   */
  public async listCIDs({ address }: { address: string }): Promise<(string | EventLog)[]> {
    if (!validator.isAddress(address)) throw new Error(`Provided address "${address}" is not Ethereum-compatible.`)
    const events = await this.getCIDStore().getPastEvents("CIDStored", { fromBlock: 0, toBlock: "latest", filter: { owner: address } })
    console.log(events)
    return events
  }

  /**
   * Store a string based CID on the blockchain.
   */
  public async storeCID({ cid, from }: { cid: string; from?: string }): Promise<TransactionReceipt> {
    if (from && !validator.isAddress(from)) throw new Error(`Provided address "${from}" is not Ethereum-compatible.`)
    return this.getCIDStore().methods.store(cid).send({ from })
  }

  /**
   * Upload a file to IPFS with Node.js and returns its CID.
   */
  public async nodeJsUploadFile({ filePath, options }: { filePath: string; options?: Partial<AddOptions> }): Promise<CID> {
    const nodeFs = await import("node:fs")
    if (!nodeFs.existsSync(filePath)) throw new Error(`File "${filePath}" does not exist.`)
    const ufs = await this.getFS()
    return ufs.addByteStream(nodeFs.createReadStream(filePath), options)
  }

  /**
   * Upload a file to IPFS using a browser environment.
   */
  public async browserUploadFile({ file, options }: { file: File; options?: Partial<AddOptions> }): Promise<CID> {
    const fileBuffer = await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result === "string") resolve(new TextEncoder().encode(reader.result))
        if (reader.result instanceof ArrayBuffer) resolve(new Uint8Array(reader.result))
      }
      reader.onerror = () => reject(new Error("Error reading file."))
      reader.readAsArrayBuffer(file)
    })
    if (!(fileBuffer instanceof Uint8Array)) throw new Error("Error while reading file. The provided file can't be converted to a Uint8Array.")
    const ufs = await this.getFS()
    return ufs.addBytes(fileBuffer, options)
  }

  /**
   * Returns a unixfs instance linked to IPFS. If no instance exists, a default one will be created.
   */
  public async getFS(): Promise<UnixFS> {
    if (!this.#fs) {
      if (!this.#helia) this.#helia = await createHelia()
      this.#fs = unixfs(this.#helia)
    }
    return this.#fs
  }

  /**
   * Returns a CIDStore Web3.js contract instance linked to the current Web3 instance.
   */
  public getCIDStore(): CIDStoreContract {
    if (!this.#CIDStore) {
      this.#CIDStore = new Contract(abi, this.#CIDStoreAddress)
      this.#CIDStore.link(this)
    }
    return this.#CIDStore
  }
}

declare module "web3" {
  interface Web3Context {
    IPFSUploadAndRegister: IPFSUploadAndRegister
  }
}
