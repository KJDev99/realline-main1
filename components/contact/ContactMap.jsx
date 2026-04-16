'use client';

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Leaflet marker default icon fix (browser-only module)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function ContactMap({ lat, lng, popupText }) {
    return (
        <MapContainer
            center={[lat, lng]}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            zoomControl={true}
            attributionControl={false}
        >
            <TileLayer
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; CartoDB'
                subdomains="abcd"
            />
            <Marker position={[lat, lng]}>
                <Popup>{popupText || 'Bizning ofis'}</Popup>
            </Marker>
        </MapContainer>
    );
}
