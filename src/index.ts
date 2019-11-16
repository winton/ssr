export class Ssr {
  dom: Window = null

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

  clientScript(
    component: string,
    stack: Record<string, string>
  ): string {
    let stackImports = `  ${component}: import("${stack[component]}"),\n`

    for (const libName in stack) {
      if (libName !== component && libName !== "loaded") {
        stackImports += `  ${libName}: import("${stack[libName]}"),\n`
      }
    }

    return `
const stack = {
${stackImports}
}
import("${stack.loaded}").then((lib) => {
  window.loaded = lib.default
  window.process = { env: { LOG: true } }
  loaded.load(stack)
  return loaded.wait("${component}")
}).then(({ ${component} }) => {
  ${component}.element()
})`
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
