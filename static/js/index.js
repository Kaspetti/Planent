const colorBins = 10
const color = d3.scaleSequential([0, colorBins], d3.interpolateBlues);
const distanceMeasure = "centroid"

let answerName
let colorIndices = {}
let activeGame = false

let alertText = document.getElementById("alert_text")

let testAnswer

function guessCountry(event) {
  if (event.keyCode !== 13) {
    return
  }

  if (!activeGame) {
    alertText.style.opacity = 1
    alertText.innerText = "Game is not active, start a new game using by pressing 'New Game'"
    return
  }

  const country = document.getElementById("input")

  if (country.value === "") {
    return
  }

  const countryObject = d3.select(`#map svg g .unit-${country.value}`)

  if (!countryObject.empty()) {
    if (countryObject.datum().properties.name === answerName) {
      countryObject.style("fill", "green")
      document.getElementById("color_tooltip").style.backgroundColor = "green"
    } else {
      const c = color(colorIndices[countryObject.datum().properties.name])
      countryObject.style("fill", c)
      document.getElementById("color_tooltip").style.backgroundColor = c
    }

  } else {
    alertText.style.opacity = 1
    alertText.innerText = `No country/area with called ${country.value}`
  }

  country.value = ""
}


function initGame() {
  colorIndices = {}
  const countries = d3.selectAll("#map svg g .unit")
  let node = countries.nodes()[Math.floor(Math.random() * countries.nodes().length)]

  let answer = d3.select(node)
  answerName = answer.datum().properties.name
  const answerCenter = d3.geoCentroid(answer.datum())

  let distances = {}
  countries.each(function(d) {
    if (d.properties.name !== answer.datum().properties.name) {
      const countryCentroid = d3.geoCentroid(d)
      let distSqrd

      if (distanceMeasure === "centroid") {
        distSqrd = Math.pow(answerCenter[0] - countryCentroid[0], 2) + Math.pow(answerCenter[1] - countryCentroid[1], 2)
      } else {
        distSqrd = calculateDistance(answer.datum(), d)
      }
      distances[d.properties.name] = Math.sqrt(distSqrd)
    }

    d3.select(this).style("fill", "#ccc")
  })

  const [minDistance, maxDistance] = Object.entries(distances).reduce(
    ([min, max], [_, value]) => [Math.min(min, value), Math.max(max, value)],
    [Infinity, -Infinity]
  );

  for (const [key, value] of Object.entries(distances)) {
    colorIndices[key] = Math.round(colorBins - ((value - minDistance) / (maxDistance - minDistance)) * colorBins)
  }

  let button = document.getElementById("new_game")
  button.innerText = "Show Answer"
  button.onclick = showAnswer

  alertText.style.opacity = 0
  activeGame = true

  testAnswer = answer
}


function showAnswer() { 
  activeGame = false
  alertText.style.opacity = 1
  alertText.innerText = `The answer was ${answerName}`

  const countries = d3.selectAll("#map svg g .unit")
  countries.each(function(d) {
    const country = d3.select(this)
    if (d.properties.name === answerName) {
      country.style("fill", "green")  
    } else {
      const c = color(colorIndices[d.properties.name])
      country.style("fill", c)
    }
  })

  let button = document.getElementById("new_game")
  button.innerText = "New Game"
  button.onclick = initGame
}


function calculateDistance(d1, d2) {
  let d1Coords = d1.geometry.coordinates.flat()
  let d2Coords = d2.geometry.coordinates.flat()

  if (d1Coords[0][0].length) {
    d1Coords = [].concat(...d1Coords) 
  }

  if (d2Coords[0][0].length) {
    d2Coords = [].concat(...d2Coords)
  }

  let minDist = Infinity
  d1Coords.forEach(function(c1) {
    d2Coords.forEach(function(c2) {
      minDist = Math.min(minDist, Math.pow(c1[0] - c2[0], 2) + Math.pow(c1[1] - c2[1], 2))
    })
  })

  return minDist
}


function initMap() {
  let map = d3.geomap()
    .geofile("/static/data/topojson.json")
    .units("countries")
    .unitId("name")
    .unitTitle("")

  map.draw(d3.select('#map'))

  // d3.csv("/static/data/all.csv", function(data) {
  //   console.log(data)
  // })
}
initMap()
