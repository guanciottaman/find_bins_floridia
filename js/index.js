const indBinIcon = L.icon({
    iconUrl: 'icons/bin-indifferenziata.png',
    iconSize: [36, 40],
    iconAnchor: [18, 40],
    popupAnchor: [0, -30]
});

const difBinIcon = L.icon({
    iconUrl: 'icons/bin-differenziata.png',
    iconSize: [36, 40],
    iconAnchor: [18, 40],
    popupAnchor: [0, -30]
});

const vetroBinIcon = L.icon({
    iconUrl: 'icons/vetro.png',
    iconSize: [36, 40],
    iconAnchor: [18, 40],
    popupAnchor: [0, -30]
});

const dogBinIcon = L.icon({
    iconUrl: 'icons/dog.png',
    iconSize: [36, 40],
    iconAnchor: [18, 40],
    popupAnchor: [0, -30]
});

const olioBinIcon = L.icon({
    iconUrl: 'icons/olio.png',
    iconSize: [36, 40],
    iconAnchor: [18, 40],
    popupAnchor: [0, -30]
});

const binIcons = {
  indifferenziata: indBinIcon,
  differenziata: difBinIcon,
  vetro: vetroBinIcon,
  olio: olioBinIcon,
  "deiezioni canine": dogBinIcon
};



function addCestinoMarker(cestino, open = false) {
    const icon = binIcons[cestino.tipo] || indBinIcon;
    const marker = L.marker([cestino.lat, cestino.lon], {icon: icon}).addTo(map)
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
            ">Mostrami la mia posizione
          </button>
      </div>`);


let firstUpdate = true;

if(open) position_marker.openPopup();

position_marker.on('popupopen', () => {
    const btn = document.getElementById('geolocateBtn');
    if(btn) {
        btn.addEventListener('click', () => {
            if(navigator.geolocation) {
                navigator.geolocation.watchPosition(pos => {
                    const { latitude, longitude } = pos.coords;
                    position_marker.setLatLng([latitude, longitude]);
                    if(firstUpdate) {
                        map.setView([latitude, longitude], map.getZoom());
                        firstUpdate = false;
                    }
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
  .then(res => {
    console.log('fetch status:', res.status);
    return res.json();
  })
  .then(data => {
    data.features.forEach((feature, index) => {
        const id = index + 1;
        const name = `Cestino ${id}`;
        addCestinoMarker({
            lat: feature.geometry.coordinates[1],
            lon: feature.geometry.coordinates[0],
            nome: name,
            tipo: feature.properties.tipo
      });
    });
  })
  .catch(err => console.error('FETCH ERROR:', err));


L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
	subdomains: 'abcd',
	maxZoom: 20
}).addTo(map);