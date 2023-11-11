<script setup lang="ts">
import HelloWorld from "./components/HelloWorld.vue"
import Dashboard from "./components/Dashboard.vue"
</script>

<template>
  <header>
    <img alt="Vue logo" class="logo" src="https://raw.githubusercontent.com/web3/web3.js/4.x/assets/logo/web3js.jpg" width="125" height="125">

    <div class="wrapper">
      <HelloWorld msg="IPFS Web3 Plugin" />
    </div>
  </header>

  <main>
    <Dashboard />
  </main>
</template>

<style scoped>
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
