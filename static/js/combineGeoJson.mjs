import * as geoJson from 'world-geojson'
import * as fs from 'fs'

const countries = fs.readdirSync('./node_modules/world-geojson/countries');
const areas = fs.readdirSync('./node_modules/world-geojson/areas')

let allCountries = {
  type: "FeatureCollection",
  features: [],
}

const isClockwise = (ring) => {
    let sum = 0;
    for (let i = 0; i < ring.length - 1; i++) {
      let p1 = ring[i], p2 = ring[i + 1];
      sum += (p2[0] - p1[0]) * (p2[1] + p1[1]);
    }
    return sum > 0;
  };

countries.slice().forEach(function(c) {
  const countryName = c.replace(/\.[^/.]+$/, "")
  if (areas.includes(countryName)) {
    let cAreas = fs.readdirSync(`./node_modules/world-geojson/areas/${countryName}`)

    cAreas.forEach(function(ca) {
      const areaName = ca.replace(/\.[^/.]+$/, "")
      if (areaName !== "united_kingdom") {
        const gjs = geoJson.forArea(countryName, areaName)

        let feature = {
          type: "Feature",
          properties: {
            name: areaName === "mainland" ? countryName : areaName,
          },
          geometry: {
            coordinates: [],
            type: "Polygon",
          },
        }

        gjs.features.forEach(function(f) {
          f.geometry.coordinates.forEach(function(c) {
            if (isClockwise(c)) {
              feature.geometry.coordinates.push(c)
            } else {
              feature.geometry.coordinates.push(c.reverse())
            }
          })
        })

        allCountries.features.push(feature)
      }
    })
  } else {
    const gjs = geoJson.forCountry(countryName)

    let feature = {
      type: "Feature",
      properties: {
        name: countryName,
      },
      geometry: {
        coordinates: [],
        type: "Polygon",
      },
    }

    gjs.features.forEach(function(f) {
      f.geometry.coordinates.forEach(function(c) {
        if (isClockwise(c)) {
          feature.geometry.coordinates.push(c)
        } else {
          feature.geometry.coordinates.push(c.reverse())
        }
      })
    })

    allCountries.features.push(feature)
  }
})

console.log(JSON.stringify(allCountries))
