import undomType from "undom"

export class Ssr {
  getElementById(el: Element, id: string): Element {
    if (el.id && el.id === id) {
      return el
    }

    for (let i = 0; i < el.childNodes.length; i++) {
      const found = this.getElementById(el[i], id)

      if (found) {
        return found
      }
    }
  }

  resetUndom(undom: any): void {
    global["window"] = undom.defaultView

    for (const i in global["window"]) {
      global[i] = global["window"][i]
    }

    global["document"]["getElementById"] = (
      id: string
    ): Element => {
      return this.getElementById(document.body, id)
    }
  }

  serializeHtml(el: Element): string {
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
      c = this.serializeHtml(el.childNodes[i] as Element)
      if (c) {
        str += c
      }
    }

    return str + "</" + name + ">"
  }
}

export default new Ssr()
