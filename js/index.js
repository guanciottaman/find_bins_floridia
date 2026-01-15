const binIcon = L.icon({
    iconUrl: 'icons/bin.png',
    iconSize: [36, 40],
    iconAnchor: [18, 40],
    popupAnchor: [0, -30]
});

function addCestinoMarker(cestino, open = false) {
    const marker = L.marker([cestino.lat, cestino.lon], {icon: binIcon}).addTo(map)
        .bindPopup(`
            <div style="text-align:center;">
                <h3>${cestino.nome}</h3>
                <p>Tipo: ${cestino.tipo}</p>
            </div>`);
    if(open) marker.openPopup();
}

const params = new URLSearchParams(window.location.search);

let lat = parseFloat(params.get('lat'));
let lon = parseFloat(params.get('lon'));
const id = params.get('id');

if (isNaN(lat) || isNaN(lon)) {
    lat = 37.081973816466935;
    lon = 15.152681789991972;
}

const map = L.map('map',
  {
    center: [37.081973816466935, 15.152681789991972],
    zoom: 18,
    minZoom: 15,
    maxZoom: 20
  }
)

let position_marker = L.circleMarker([lat, lon], {
  radius: 6,
  color: '#0b37e7',
  fillColor: '#274ee9',
  fillOpacity: 0.9
}).addTo(map)
  .bindPopup(`
      <div style="text-align:center;">
          <h3>La tua posizione</h3>
          <button id="geolocateBtn" style="
                background-color: dodgerblue;
                color: white;
                border: none;
                border-radius: 5px;
                padding: 4px 8px;
                font-size: 12px;
                cursor: pointer;
            ": dodgerblue>Mostrami la mia posizione
          </button>
      </div>`);

if(open) position_marker.openPopup();

position_marker.on('popupopen', () => {
    const btn = document.getElementById('geolocateBtn');
    if(btn) {
        btn.addEventListener('click', () => {
            if(navigator.geolocation) {
                navigator.geolocation.watchPosition(pos => {
                    const { latitude, longitude } = pos.coords;
                    position_marker.setLatLng([latitude, longitude]);
                    map.setView([latitude, longitude], map.getZoom());
                }, err => {
                    console.error('Errore geolocalizzazione:', err);
                }, {
                    enableHighAccuracy: true,
                    maximumAge: 1000,
                    timeout: 5000
                });
            } else {
                alert('Geolocalizzazione non supportata');
            }
        }, { once: true });
    }
});

fetch('data/cestini.geojson')
  .then(res => res.json())
  .then(data => {
    data.features.forEach(feature => {
      addCestinoMarker({
        lat: feature.geometry.coordinates[1],
        lon: feature.geometry.coordinates[0],
        nome: feature.properties.nome,
        tipo: feature.properties.tipo
      }, false);
    });
  });

L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
	subdomains: 'abcd',
	maxZoom: 20
}).addTo(map);