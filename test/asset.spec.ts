import { join } from "path"

import expect from "./expect"
import { clientAssets, serverAsset } from "../src/asset"

const root = join(__dirname, "../")

describe("clientAsset", () => {
  it("should return client paths", async () => {
    expect(await clientAssets({ index: "./dist" })).toEqual(
      {
        index: "/dist/esm/index.mjs",
      }
    )
  })
})

describe("serverAsset", () => {
  it("should return correct ts path", async () => {
    const [code, type] =
      (await serverAsset(root, "/test/asset.spec.ts")) || []

    expect(code).toBe(200)
    expect(type).toBe("application/typescript")
  })

  it("should return void if not found", async () => {
    expect(await serverAsset(root, "/404")).toBeUndefined()
  })

  it("should return correct dist path", async () => {
    const [code, type] =
      (await serverAsset(root, "/dist/esm/index.mjs")) || []

    expect(code).toBe(200)
    expect(type).toBe("text/javascript")
  })

  it("should return correct node_modules path", async () => {
    const [code, type] =
      (await serverAsset(
        root,
        "/node_modules/@fn2/loaded/dist/esm/index.mjs"
      )) || []

    expect(code).toBe(200)
    expect(type).toBe("text/javascript")
  })
})
