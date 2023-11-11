import { createHelia } from "helia"
import { strings } from "@helia/strings"
import { json } from "@helia/json"
import { dagJson } from "@helia/dag-json"

import { beforeAll, describe, expect, it } from "vitest"

describe("Helia Unit tests", () => {
  let helia: Awaited<ReturnType<typeof createHelia>>

  beforeAll(async () => {
    helia = await createHelia()
  })

  it("should create helia", async () => {
    expect(helia).toBeDefined()
  })

  it("should add string", async () => {
    const s = strings(helia)
    const myImmutableAddress = await s.add("hello world")
    expect(await s.get(myImmutableAddress)).toBe("hello world")
  })

  it("should add json", async () => {
    const j = json(helia)
    const myImmutableAddress = await j.add({ name: "hello world" })
    expect(await j.get(myImmutableAddress)).toMatchObject({ name: "hello world" })
  })

  it("should add dag-json", async () => {
    const dJ = dagJson(helia)
    const object1 = { hello: "world" }
    const myImmutableAddress1 = await dJ.add(object1)

    const object2 = { link: myImmutableAddress1 }
    const myImmutableAddress2 = await dJ.add(object2)

    const retrievedObject = await dJ.get(myImmutableAddress2) as typeof object2

    expect(retrievedObject).toMatchObject(object2)
    expect(await dJ.get(retrievedObject.link)).toMatchObject(object1)
  })
})
