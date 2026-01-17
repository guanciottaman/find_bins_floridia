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

const medBinIcon = L.icon({
    iconUrl: 'icons/medicine.png',
    iconSize: [36, 40],
    iconAnchor: [18, 40],
    popupAnchor: [0, -30]
});

const binIcons = {
  indifferenziata: indBinIcon,
  differenziata: difBinIcon,
  vetro: vetroBinIcon,
  olio: olioBinIcon,
  "deiezioni canine": dogBinIcon,
  farmaci: medBinIcon
};

let cestini = []

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

function startGeolocation() {
    if(navigator.geolocation) {
        navigator.geolocation.watchPosition(pos => {
            const { latitude, longitude } = pos.coords;
            position_marker.setLatLng([latitude, longitude]);
            if(firstUpdate) {
                map.setView([latitude, longitude], map.getZoom());
                firstUpdate = false;
            }
            map.closePopup();
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
}

let position_marker = L.circleMarker([lat, lon], {
  radius: 6,
  color: '#0b37e7',
  fillColor: '#274ee9',
  fillOpacity: 0.9
}).addTo(map)
  .bindPopup(`
      <div style="text-align:center;">
          <h3>La tua posizione</h3>
          <button onclick="startGeolocation()" id="geolocateBtn">Mostrami la mia posizione
          </button>
      </div>`);




let firstUpdate = true;

position_marker.openPopup();


fetch('data/cestini.geojson')
  .then(res => {
    console.log('fetch status:', res.status);
    return res.json();
  })
  .then(data => {
    data.features.forEach((feature, index) => {
        const id = index + 1;
        const lat = feature.geometry.coordinates[1];
        const lon = feature.geometry.coordinates[0];
        const name = `Cestino ${id}`;
        const tipo = feature.properties.tipo
        const icon = binIcons[tipo] || indBinIcon;
        const marker = L.marker([lat, lon], {icon: icon}).addTo(map)
            .bindPopup(`
                <div style="text-align:center;">
                    <h3>${name}</h3>
                    <p>Tipo: ${tipo}</p>
                    <button id="gotoBtn">Indicazioni</button>
                </div>`);
        marker.on('popupopen', () => {
            const btn = marker.getPopup().getElement().querySelector('#gotoBtn');
            if(btn) {
                btn.addEventListener('click', () => {
                    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;
                    window.open(url, '_blank');
                });
            }
        });
        marker.tipo = tipo;
        const cestino = {
            lat: lat,
            lon: lon,
            nome: name,
            icon: icon,
            tipo: tipo,
            marker: marker
        }
        cestini.push(cestino);
    });
  })
  .catch(err => console.error('FETCH ERROR:', err));

L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
	subdomains: 'abcd',
	maxZoom: 20
}).addTo(map);

const filterBtn = document.getElementById('filterBtn');
const filterPanel = document.getElementById('filterPanel');

filterBtn.addEventListener('click', () => {
    filterPanel.style.display = filterPanel.style.display === 'block' ? 'none' : 'block';
});

document.addEventListener('click', (e) => {
    if (!filterPanel.contains(e.target) && e.target !== filterBtn) {
        filterPanel.style.display = 'none';
    }
});

filterPanel.addEventListener('click', (e) => {
    e.stopPropagation();
});


document.querySelectorAll('#filterPanel input[type="checkbox"]').forEach(checkbox => {
    checkbox.checked = true;
    checkbox.addEventListener('change', () => {
        const tipo = checkbox.value;
        const show = checkbox.checked;

        cestini.forEach(cestino => {
            if(cestino.tipo === tipo) {
                if(show) map.addLayer(cestino.marker);
                else map.removeLayer(cestino.marker);
            }
        });
    });
});


