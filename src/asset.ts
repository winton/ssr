import { join } from "path"
import globby from "globby"
import { readFile } from "fs-extra"

export const EXT_REGEX = /(.+)(\.[^\.]+)$/

export async function clientAssets(
  paths: Record<string, string>
): Promise<Record<string, string>> {
  const filled = {}
  const promises = []

  for (const id in paths) {
    const nodeModule = paths[id].includes("/node_modules/")

    const mjs = process.env.STAGE || nodeModule
    const name = mjs ? `${id}-*` : id

    const subdir =
      id.includes("Component") && !mjs ? "components/" : ""

    const dir = mjs ? "mjs" : "esm"
    const ext = mjs ? "mjs" : "js"

    promises.push(
      (async (): Promise<void> => {
        const glob = [
          paths[id],
          dir,
          `${subdir}${name}.${ext}`,
        ].join("/")

        filled[id] = (await globby(glob))[0]
          .replace(".js", ".mjs")
          .slice(1)
      })()
    )
  }

  await Promise.all(promises)

  return filled
}

export async function serverAsset(
  root: string,
  path: string
): Promise<[number, string, string] | void> {
  const match = path.match(EXT_REGEX)

  if (!match || !match[2]) {
    return
  }

  let [, name, ext] = match
  let map = ""

  if (ext === ".map") {
    map = ext
    ;[, name, ext] = name.match(EXT_REGEX)
  }

  const nameExt = process.env.STAGE ? "" : "-*"

  const glob = [
    join(root, path),
    join(root, `${name}${nameExt}${ext}${map}`),
    join(root, `${name}.js${map}`),
  ]

  const paths = await globby(glob)

  if (paths[0]) {
    const mjs = await readFile(paths[0])

    let contentType = "text/javascript"

    if (ext === ".css") {
      contentType = "text/css"
    }

    if (ext === ".ts") {
      contentType = "application/typescript"
    }

    if (map) {
      contentType = "application/json"
    }

    return [200, contentType, mjs.toString()]
  }
}
