import * as d3 from "d3"

async function init() {
  let topology = await d3.json("./static/data/topojson.json")
  console.log(topology)
}

init()

