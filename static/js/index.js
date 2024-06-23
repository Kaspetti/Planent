// Set the amount of color bins used when showing the answer
// and the distance measure to use ("centroid", "")
const colorBins = 10
const color = d3.scaleSequential([0, colorBins], d3.interpolateBlues);
const distanceMeasure = "centroid"

let answerName
let colorIndices = {}   // The color indices for the countries. Will be in the range 0-colorBins
let activeGame = false  // Used for preventing input inbetween games

let distances = {}      // The distance from each country to each other country

let alertText = document.getElementById("alert_text")

function guessCountry(event) {
  // Enter key
  if (event.keyCode !== 13) {
    return
  }

  // If input is given inbetween games alert that the game is not active
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

  if (!countryObject.empty()) { // Country exist
    if (countryObject.datum().properties.name === answerName) {
      countryObject.style("fill", "green")
      document.getElementById("color_tooltip").style.backgroundColor = "green"
    } else { 
      const c = color(colorIndices[countryObject.datum().properties.name])
      countryObject.style("fill", c)
      document.getElementById("color_tooltip").style.backgroundColor = c
    }
  } else { // Country does not exist
    alertText.style.opacity = 1
    alertText.innerText = `No country/area with called ${country.value}`
  }

  country.value = ""
}


// Initalizes the game by clearing the country colors, choosing a random country as answer and
// populating the colorIndices object according to the distances
function initGame() {
  colorIndices = {}
  const countries = d3.selectAll("#map svg g .unit")
  let node = countries.nodes()[Math.floor(Math.random() * countries.nodes().length)]

  let answer = d3.select(node)
  answerName = answer.datum().properties.name

  countries.each(function() {
    d3.select(this).style("fill", "#ccc")
  })

  if (distanceMeasure === "centroid") {
    let dists = {}
    const countries = d3.selectAll("#map svg g .unit")
    countries.each(function(d) {
      const c1 = d3.geoCentroid(answer.datum())
      const c2 = d3.geoCentroid(d)

      dists[d.properties.name] = Math.sqrt(Math.pow(c1[0] - c2[0], 2) + Math.pow(c1[1] - c2[1], 2))

    })
    const minDistance = Math.min(...Object.values(dists))
    const maxDistance = Math.max(...Object.values(dists))

    for (const [key, value] of Object.entries(dists)) {
      colorIndices[key] = Math.round(colorBins - ((value - minDistance) / (maxDistance - minDistance)) * colorBins)
    }
  } else {
    if (distanceMeasure !== "closest") {
      console.warn(`Invalid distance measure: '${distanceMeasure}'. Valid are: 'centroid' and 'closest'. Defaults to 'closest'.`)
    }
    const dists = Object.values(distances[answerName])
    const powBase = 0.3   // Change this for different gradient. Default distances without power looks strange
    const powDists = dists.map(d => Math.pow(d, powBase))
    const minDistance = Math.min(...powDists) 
    const maxDistance = Math.max(...powDists)

    for (const [key, value] of Object.entries(distances[answerName])) {
      const powDist = Math.pow(value, powBase)
      colorIndices[key] = Math.round(colorBins - ((powDist - minDistance) / (maxDistance - minDistance)) * colorBins)
    }
  }


  let button = document.getElementById("new_game")
  button.innerText = "Show Answer"
  button.onclick = showAnswer

  alertText.style.opacity = 0
  activeGame = true

}


// Show the answer by coloring all the countries according to
// their color index, and the answer in green
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


// Initalize the map using the d3-geomap library
// Import the precalculated distances
async function initMap() {
  let map = d3.geomap()
    .geofile("/static/data/topojson.json")
    .units("countries")
    .unitId("name")
    .unitTitle("")

  map.draw(d3.select('#map'))

  distances = await d3.json("/static/data/distances.json")  

  // d3.csv("/static/data/all.csv", function(data) {
  //   console.log(data)
  // })
}
initMap()
