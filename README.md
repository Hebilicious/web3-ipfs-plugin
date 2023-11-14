# [Typescript] Web3.js Plugin for IPFS

This repository is done as an exercise for an interview with Chainsafe. 

In this repository I will detail my thought process while making this test.
This repository will also contains a frontend to be able to run e2e browser tests.

I've created another repository at https://github.com/Hebilicious/ipfs-web3 that forks from the template and follows the requirement without the additional complexity.

## Setup

- Make sure to have `bun` and `node` installed.
- Add a `PRIVATE_KEY` environment variable to your env file with a private key, and get test ETH from the faucet (You can use `bunx npx mnemonic-to-private-key` to generate your own wallet / private key)
- Use `bun i` to install dependencies at the root of the monorepo. Then use `bun run` to run each relevant script.

## TL;DR

- Install dependencies : `bun i`
- Build Library : `bun run build`
- Add `PRIVATE_KEY` to .env file
- Node Tests : `bun run test`
- UI : `cd playgrounds/ipfs-web3 && bun run dev` (Make sure to build the library before!)
- Browser e2e tests : `cd playgrounds/ipfs-web3 && bun run test:e2e` (make sure to have playwright browsers installed : `bunx playwright install`)

## Choices

Here are some of the reasoning behind the choices :

### Bun

Bun is being used for multiple reasons :

- DX:  faster dependency install, out-of-the-box monorepo support and immediate Typescript support.
- 2: user of this plugin or contributors might be using a different runtime that node

### Helia

As the IPFS-js library is deprecated, we're using the new recommended official library : [Helia](https://github.com/ipfs/helia).

### Vitest

Faster and simpler to configure with the same API as jest.

### Frontend

To make sure that the project works in a browser context, it's ideal to test it against a real browser. We'll use vite and vue for the simplicity and rapidity of the setup with playwright e2e tests. To run the browser project, build the library with `bun run build` then change directory to `playgrounds/ipfs-web3` and run `bun run dev`.

## Plugin and methods

The source code can be found in `src/index.ts`.
We'll also include a build command (with tsup for the sake of simplicity).
To run the build command, use `bun run build`.

Several public methods have been added to the plugin for developper convenience and advanced use cases:

The methods described in the exercise have been implemented in a universal way, so that they can be used in a browser context as well as a node context.

- `uploadAndStore` : Implementation of the first method described in the exercise.
- `listCIDs` : Implementation of the 2nd method described in the exercise.

### Additional methods

- `storeCID` : Stores a CID in the contract
- `nodeJsUploadFile` : Uploads a file to IPFS and returns the CID for node.
- `browserUploadFile` : Uploads a file to IPFS and returns the CID for the browser.
- `getFS` : Returns the IPFS unixfs instance
- `getCIDStore` : Returns the CID store web3 contract instance

Note that if this isn't desirable to expose that much, these methods can be made private.

## Tests

### Node tests

The node tests can be found in the test directory

- `e2e.test.ts` : Tests the 2 main methods of the plugin according to the exercise.
- `helia.test.ts` : For debugging purpose, to test that the IPFS setup as well as vitest are working properly.

Run the tests with `bun run test`. This will use vitest and node.js under the hood.

### Frontend Tests

As the exercise specify :

`Write fully working E2E tests for both main functions of your Plugin. Test should run for
Node.js and also for web browser platforms.`

Browsers are not allowed to open a file without explicit user input, we will use playwright to guarantee that our code is browser compatible.

We'll create a quick frontend with vite and vue.js that we'll use to test the plugin.

The source code for the relevant logic can be found in `playgrounds/ipfs-web3/src/components/Dashboard.vue`.

The source code for the browser e2e test can be found in `playgrounds/ipfs-web3/e2e/ipfs-web3.spec.ts`.

Make sure that the playwright browsers are installed on your system : `bunx playwright install`

To run the browser e2e test, change directory to `playgrounds/ipfs-web3` and run `bun run test:e2e`.

## Conclusion

As this in a one day exercise, we could find room for improvement in the following areas:

- Publishing to NPM : Publishing the library to NPM would be the first step to make it usable by other developers.
- CI Testing : Settings up Github actions workflow to automatically test the library is a good idea when open sourcing.
- Contribution guide : Write information regarding contribution, as well as create PR template.
- IPFS Testing : We could add more tests to make sure that all file types are supported, and that the IPFS options are working as expected.
- Documentation and examples : While there is example and the code is well documented, We could improve even further by documenting each individual parameter of the plugin methods by using dedicated interfaces. We should also include a dedicated website with documentation and examples.
- Marketing : This is out of scope, but an open source projects needs to be visible to be used. Tweeting about it, writing blog articles and including documentation examples in the main website would be a good way to start getting some users. Contributing examples in the Helia repository would also be a good way to get some visibility.
