const colorBins = 20
const color = d3.scaleSequential([0, colorBins], d3.interpolateBlues);
let answer

let activeGame = false

let colorIndices = {}

function guessCountry(event) {
  if (event.keyCode !== 13) {
    return
  }

  // initGame()
  // console.log(answer.datum().properties.name)
  //
  // const countries = d3.selectAll("#map svg g .unit")
  // countries.each(function(d) {
  //   const country = d3.select(this)
  //
  //   if (country.datum().properties.name === answer.datum().properties.name) {
  //     country.style("fill", "green")
  //   } else {
  //     country.style("fill", color(colorIndices[d.properties.name]))
  //   }
  // })

  // const country = document.getElementById("input")
  // const countryTopology = d3.select(`#map svg g .unit-${country.value}`)
  //
  //
  // if (!countryTopology.empty()) {
  //   countryTopology.style("fill", color(Math.random() * 100))
  // } else {
  //   console.log(`no country with code ${country.value}`)
  // }
  //
  // country.value = ""
}



function initGame() {
  const countries = d3.selectAll("#map svg g .unit")
  let node = countries.nodes()[Math.floor(Math.random() * countries.nodes().length)]

  answer = d3.select(node)
  const answerCenter = d3.geoCentroid(answer.datum())

  let distances = {}
  countries.each(function(d) {
    if (d.properties.name !== answer.datum().properties.name) {
      const countryCentroid = d3.geoCentroid(d)

      const distSqrd = Math.pow(answerCenter[0] - countryCentroid[0], 2) + Math.pow(answerCenter[1] - countryCentroid[1], 2)
      distances[d.properties.name] = Math.sqrt(distSqrd)
    }
  })

  const [minDistance, maxDistance] = Object.entries(distances).reduce(
    ([min, max], [_, value]) => [Math.min(min, value), Math.max(max, value)],
    [Infinity, -Infinity]
  );

  for (const [key, value] of Object.entries(distances)) {
    colorIndices[key] = Math.round(colorBins - ((value - minDistance) / (maxDistance - minDistance)) * colorBins)
  }
}

function initMap() {
  let map = d3.geomap()
    .geofile("/static/data/topojson.json")
    .units("countries")
    .unitId("name")
    .unitTitle("")

  map.draw(d3.select('#map'))
}
initMap()
