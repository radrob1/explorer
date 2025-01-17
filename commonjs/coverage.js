const { Client } = require('@helium/http')
const geoJSON = require('geojson')
const ColorHash = require('color-hash').default
const maxBy = require('lodash/maxBy')
const { s3 } = require('./aws')

const colorHash = new ColorHash({ saturation: 0.5 })

const MAX_HOTSPOTS_TO_FETCH = 200000

const toGeoJSON = (hotspots) =>
  geoJSON.parse(hotspots, {
    Point: ['lat', 'lng'],
    include: [
      'address',
      'owner',
      'location',
      'location_hex',
      'status',
      'blockAdded',
      'ownerColor',
      'rewardScale',
    ],
  })

const fetchCoverage = async () => {
  const client = new Client()
  const list = await client.hotspots.list()
  const hotspots = await list.takeJSON(MAX_HOTSPOTS_TO_FETCH)
  const hotspotsWithLocation = hotspots
    .filter((h) => !!h.lat && !!h.lng)
    .map((h) => ({
      ...h,
      location: [h.geocode.longCity, h.geocode.shortState]
        .filter(Boolean)
        .join(', '),
      status: h.status.online,
      ownerColor: colorHash.hex(h.owner),
    }))

  return toGeoJSON(hotspotsWithLocation)
}

const emptyCoverage = () => {
  return toGeoJSON([])
}

const latestCoverageUrl = () => {
  if (!process.env.AWS_ACCESS_KEY_ID) {
    return 'https://helium-explorer.s3-us-west-2.amazonaws.com/coverage/coverage.geojson'
  }

  return new Promise((resolve, reject) => {
    s3.listObjects(
      { Bucket: 'helium-explorer', Prefix: 'coverage/' },
      (err, data) => {
        if (err) {
          reject(err)
        }

        const file = maxBy(data.Contents, ({ Key }) =>
          parseInt(Key.match(/coverage-(\d+)\.geojson/)?.[1] || 0),
        )

        if (!file) {
          reject('not found')
        }

        const url = `https://helium-explorer.s3-us-west-2.amazonaws.com/${file.Key}`

        resolve(url)
      },
    )
  })
}

module.exports = { fetchCoverage, emptyCoverage, latestCoverageUrl }
