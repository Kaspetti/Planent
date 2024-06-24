import * as fs from "fs"
import * as topojson from "topojson-client"

fs.readFile('./static/data/map.topojson', 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading the file:', err);
    return;
  }

  let distances = {}

  try {
    const topology = JSON.parse(data);
    const geoJson = topojson.feature(topology, topology.objects.collection);

    geoJson.features.forEach(function(c1) {
      distances[c1.properties.name] = {}
      geoJson.features.forEach(function(c2) {
        if (c2.properties.name === "spain") {
          console.log(c2.geometry.coordinates)
        }
        if (c1 !== c2) {
          distances[c1.properties.name][c2.properties.name] = calculateDistance(c1, c2)
        }
      })
    })

    console.log(JSON.stringify(distances))

  } catch (error) {
    console.error('Error parsing the JSON:', error);
  }
});




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

  return Math.sqrt(minDist)
}

