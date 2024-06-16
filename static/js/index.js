const color = d3.scaleSequential([0, 200], d3.interpolateBlues);


function guessCountry(event) {
  if (event.keyCode !== 13) {
    return
  }

  let countries = d3.selectAll("#map svg g .unit")
  countries.each(function() {
    let country = d3.select(this)
    country.style("fill", color(50))
  })

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


async function initMap() {
  let map = d3.geomap()
    .geofile("/static/data/topojson.json")
    .units("countries")
    .unitId("name")
    .unitTitle("")

  map.draw(d3.select('#map'))
}

initMap()
