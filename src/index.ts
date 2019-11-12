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

    for (let i = 0; i < el.childNodes.length; i++) {
      const found = this.getElementById(el[i], id)

      if (found) {
        return found
      }
    }
  }
}

export default new Ssr()
