<script setup lang="ts">
defineProps<{
  msg: string
}>()
</script>

<template>
  <div class="greetings">
    <h1 class="green">
      {{ msg }}
    </h1>
    <h3>
      This is a test project to demonstrate the usage of the IPFS-web3 plugin
      <a href="https://docs.web3js.org/" target="_blank" rel="noopener">Web3</a> +
      <a href="https://github.com/ipfs/helia" target="_blank" rel="noopener">Helia (IPFS)</a>.
    </h3>
  </div>
</template>

<style scoped>
h1 {
  font-weight: 500;
  font-size: 2.6rem;
  position: relative;
  top: -10px;
}

h3 {
  font-size: 1.2rem;
}

.greetings h1,
.greetings h3 {
  text-align: center;
}

@media (min-width: 1024px) {
  .greetings h1,
  .greetings h3 {
    text-align: left;
  }
}
</style>
