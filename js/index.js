function addCestinoMarker(cestino, open = false) {
    const marker = L.marker([cestino.lat, cestino.lon]).addTo(map)
        .bindPopup(`
            <div style="text-align:center;">
                <h3>${cestino.nome}</h3>
                <p>Tipo: ${cestino.tipo}</p>
            </div>`);
    if(open) marker.openPopup();
}

const params = new URLSearchParams(window.location.search);

const lat = parseFloat(params.get('lat'));
const lon = parseFloat(params.get('lon'));
const id = params.get('id');

console.log(lat, lon, id);


const map = L.map('map',
    {
        center: [37.081973816466935, 15.152681789991972],
        zoom: 18,
        minZoom: 15,
        maxZoom: 18
    }
)

fetch('data/cestini.geojson')
  .then(res => res.json())
  .then(data => {
    console.log(data);
    L.geoJSON(data, {
      onEachFeature: function(feature, layer) {
        layer.bindPopup(`
          <div style="text-align:center;">
            <h3>${feature.properties.nome}</h3>
            <p>Tipo: ${feature.properties.tipo}</p>
          </div>
        `);
      }
    }).addTo(map);
  });


L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);