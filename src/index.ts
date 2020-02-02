import { Fn2 } from "@fn2/loaded"

export class Ssr {
  dom: Window = null
  fn2: Fn2 = null

  loaded(): void {
    for (const i in this.dom) {
      if (i !== "document") {
        global[i] = this.dom[i]
      }
    }

    this.dom.document["getElementById"] = (
      id: string
    ): HTMLElement => {
      return this.getElementById(this.dom.document.body, id)
    }
  }

  async layout(
    headComponent: any,
    bodyComponent: any,
    ...args: any[]
  ): Promise<string> {
    const elements: Record<string, Element> = {}

    await this.fn2.run(elements, [], {
      body: () => bodyComponent.element(...args),
      head: () => headComponent.element(...args),
    })

    const body = this.serialize(elements.body)
    const head = this.serialize(elements.head)

    return `<!doctype html><html>${head}<body>${body}</body></html>`
  }

  script(
    component: string,
    libs: Record<string, string>,
    components: Record<string, string>
  ): string {
    let imports = `  ${component}: import("${components[component]}"),\n`

    for (const libName in libs) {
      if (libName !== "loaded") {
        imports += `  ${libName}: import("${libs[libName]}"),\n`
      }
    }

    return `
const stack = {
${imports}}
import("${libs.loaded}").then((lib) => {
  window.loaded = lib.default
  loaded.load(stack)
  return loaded.wait("${component}")
}).then(({ ${component} }) => {
  ${component}.element()
});`
  }

  serialize(el: Element): string {
    if (el.nodeType === 3) {
      return el.nodeValue
    }

    const name = String(el.nodeName).toLowerCase()
    const hits: Record<string, boolean> = {}

    let str = "<" + name
    let c: string

    for (let i = 0; i < el.attributes.length; i++) {
      hits[el.attributes[i].name] = true
      str +=
        " " +
        el.attributes[i].name +
        '="' +
        el.attributes[i].value +
        '"'
    }

    if (el.className && !hits.class) {
      str += ' class="' + el.className + '"'
    }

    if (el.id) {
      str += ' id="' + el.id + '"'
    }

    str += ">"

    for (let i = 0; i < el.childNodes.length; i++) {
      c = this.serialize(el.childNodes[i] as Element)
      if (c) {
        str += c
      }
    }

    return str + "</" + name + ">"
  }

  private getElementById(
    el: HTMLElement,
    id: string
  ): HTMLElement {
    if (el.id && el.id === id) {
      return el
    }

    for (let i = 0; i < el.children.length; i++) {
      const found = this.getElementById(
        el.children[i] as HTMLElement,
        id
      )

      if (found) {
        return found
      }
    }
  }
}

export default new Ssr()
