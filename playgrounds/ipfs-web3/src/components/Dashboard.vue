<script setup lang="ts">
import Web3 from "web3"
import { ref } from "vue"
import { IPFSUploadAndRegister } from "../../../../dist/index"

import Item from "./Item.vue"

import EcosystemIcon from "./icons/IconEcosystem.vue"
import DocumentationIcon from "./icons/IconDocumentation.vue"
import CommunityIcon from "./icons/IconCommunity.vue"

// @ts-expect-error polyfill
// eslint-disable-next-line no-extend-native, max-statements-per-line
BigInt.prototype.toJSON = function () { return this.toString() }

const privateKey = `0x${import.meta.env.VITE_PRIVATE_KEY}`

const uploadStatus = ref<Awaited<ReturnType<typeof uploadToIpfs>>>()
const queryStatus = ref<Awaited<ReturnType<typeof queryCIDStore>>>()

const uploadLoading = ref(false)
const queryLoading = ref(false)

const queryAddress = ref("0x7cc8aa98cc49d3e68413033455d2dc0d29b8b112")

const getElement = (e: Event) => e.target as HTMLInputElement

const uploadToIpfs = async (file: File) => {
  const web3 = new Web3("https://1rpc.io/sepolia")
  web3.registerPlugin(new IPFSUploadAndRegister())
  const acc = web3.eth.accounts.wallet.add(privateKey).get(0)
  if (!acc) throw new Error("Account not found")
  uploadLoading.value = true
  const result = await web3.IPFSUploadAndRegister.uploadAndStore({ file, from: acc.address })
  uploadStatus.value = result
  uploadLoading.value = false
  return result
}

const onUpload = (e: Event) => {
  const file = getElement(e).files?.[0]
  console.log("file uploaded", e, file)
  if (!file) return
  return uploadToIpfs(file)
}

const queryCIDStore = async () => {
  const web3 = new Web3("https://1rpc.io/sepolia")
  web3.registerPlugin(new IPFSUploadAndRegister())
  queryLoading.value = true
  const result = await web3.IPFSUploadAndRegister.listCIDs({ address: queryAddress.value })
  queryStatus.value = result
  queryLoading.value = false
  return result
}
</script>

<template>
  <Item>
    <template #icon>
      <EcosystemIcon />
    </template>
    <template #heading>
      Upload a File
    </template>

    <input type="file" @change="onUpload">
  </Item>

  <template v-if="uploadStatus || uploadLoading">
    <Item class="upload">
      <template #icon>
        <DocumentationIcon />
      </template>
      <template #heading>
        {{ uploadLoading ? "Uploading..." : "Upload Result" }}
      </template>
      <pre>{{ uploadStatus }}</pre>
    </Item>
  </template>

  <Item>
    <template #icon>
      <CommunityIcon />
    </template>
    <template #heading>
      Query CID Store
    </template>
    <input v-model="queryAddress" type="text" placeholder="address">

    <button class="queryButton" :disabled="queryAddress.length === 0" @click="queryCIDStore">
      Query
    </button>
  </Item>

  <template v-if="queryStatus || queryLoading">
    <Item class="query">
      <template #icon>
        <DocumentationIcon />
      </template>
      <template #heading>
        {{ queryLoading ? "Querying..." : "Query Result" }}
      </template>
      <pre>{{ queryStatus }}</pre>
    </Item>
  </template>
</template>

<style scoped>
pre {
    height: auto;
    max-height: 25rem;
    max-width: 25rem;

    overflow: auto;
    word-break: normal !important;
    word-wrap: normal !important;
    white-space: pre !important;
}
</style>
