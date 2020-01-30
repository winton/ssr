import expect from "./expect"
import assets from "../src/asset"

describe("assets", () => {
  it("should return correct ts path", async () => {
    let code: number, type: string
    const asset = await assets("/test/asset.spec.ts")

    if (asset) {
      ;[code, type] = asset
    }

    expect(code).toBe(200)
    expect(type).toBe("application/typescript")
  })

  it("should return void if not found", async () => {
    const asset = await assets("/404")
    expect(asset).toBeUndefined()
  })

  it("should return correct dist path", async () => {
    let code: number, type: string
    const asset = await assets("/dist/esm/index.mjs")

    if (asset) {
      ;[code, type] = asset
    }

    expect(code).toBe(200)
    expect(type).toBe("text/javascript")
  })

  it("should return correct node_modules path", async () => {
    let code: number, type: string
    const asset = await assets(
      "/node_modules/@fn2/loaded/dist/esm/index.mjs"
    )

    if (asset) {
      ;[code, type] = asset
    }

    expect(code).toBe(200)
    expect(type).toBe("text/javascript")
  })
})
