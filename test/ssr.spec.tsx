/** @jsx render.createElement */

import patch from "@fn2/patch"
import render from "@fn2/render"
import loaded from "@fn2/loaded"
import tinyId from "@fn2/tiny-id"
import undom from "undom"

import expect from "./expect"
import ssr from "../src"

class Component {
  render: typeof render = null

  build(): Element {
    return (
      <div>
        <h1>Hello!</h1>
        <h2>Good to see you here.</h2>
      </div>
    )
  }
}

const component = new Component()

beforeEach(() => {
  const dom = undom()

  loaded.reset()

  loaded.load({
    component,
    dom,
    patch,
    render,
    ssr,
    tinyId,
  })
})

it("serializes", () => {
  expect(ssr.serialize(component.build())).toBe(
    "<div><h1>Hello!</h1><h2>Good to see you here.</h2></div>"
  )
})

it("getElementById", () => {
  const el = <div id="hi" />
  render.doc.body.appendChild(el)
  expect(render.doc.getElementById("hi")).toBe(el)
})
