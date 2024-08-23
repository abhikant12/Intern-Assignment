import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, Marker, TileLayer } from 'react-leaflet';
import endpointer from '../assets/endpointer.png';
import pointer from '../assets/pointer.png';
import startpointer from '../assets/startpointer.png';

const startIcon = L.icon({
    iconUrl: startpointer,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
});

const endIcon = L.icon({
    iconUrl: endpointer,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
});

const movingIcon = (rotationAngle) => L.divIcon({
    html: `<img src="${pointer}" style="transform: translateX(150%) rotate(${rotationAngle}deg); position: absolute; margin-top: -45px;  width: 10px; height: 90px;" />`,
    iconSize: [0, 0],
    iconAnchor: [16, 16], // Center the icon
});

const MapComponent = () => {
    const startCoords = [22.1696, 91.4996];
    const endCoords = [22.2637, 91.7159];
    const [currentPosition, setCurrentPosition] = useState(startCoords);
    const [rotationAngle, setRotationAngle] = useState(0);
    const requestRef = useRef();

    const calculateIntermediatePoints = (start, end, steps) => {
        const points = [];
        for (let i = 1; i <= steps; i++) {
            const lat = start[0] + (end[0] - start[0]) * (i / steps);
            const lng = start[1] + (end[1] - start[1]) * (i / steps);
            points.push([lat, lng]);
        }
        return points;
    };

    const calculateRotationAngle = (current, next) => {
        const dx = next[1] - current[1];
        const dy = next[0] - current[0];
        const angle = Math.atan2(dy, dx) * (180 / Math.PI) + 40; 
        return angle;
    };

    useEffect(() => {
        const steps = 200;
        const points = calculateIntermediatePoints(startCoords, endCoords, steps);

        let index = 0;
        const animate = () => {
            if (index < points.length) {
                const nextIndex = index + 1 < points.length ? index + 1 : index;
                setRotationAngle(calculateRotationAngle(points[index], points[nextIndex]));
                setCurrentPosition(points[index]);
                index++;
                requestRef.current = requestAnimationFrame(animate);
            } else {
                cancelAnimationFrame(requestRef.current);
            }
        };

        requestRef.current = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(requestRef.current);
    }, []);

    return (
        <div style={{ height: "100vh", width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>

            {/* Navbar with start, end coordinates and speed */}
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "80%",
                padding: "10px 20px",
                marginBottom: "10px",
                backgroundColor: "#fff",
                borderRadius: "14px",
                marginTop:"30px",
                marginBottom:"30px",
            }}>
                <div style={{ textAlign: "left" }}>
                    <p><strong>Starting</strong></p>
                    <br/>
                    <p> <strong>Lat:</strong>  {startCoords[0]}</p>
                    <p> <strong>Long:</strong> {startCoords[1]}</p>
                </div>

                <div style={{ textAlign: "center" , color:"blue", }}>
                    <p><strong>Speed:</strong> 20 kmph</p>
                </div>

                <div style={{ textAlign: "left" }}>
                    <p> <strong>Ending</strong> </p>
                    <br/>
                    <p> <strong>Lat:</strong> {endCoords[0]}</p>
                    <p> <strong>Long:</strong> {endCoords[1]}</p>
                </div>
            </div>

            {/* Map Container */}
            <MapContainer center={startCoords} zoom={12} style={{ height: "70vh", width: "80%", borderRadius: "14px" }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <Marker position={startCoords} icon={startIcon} />

                <Marker position={endCoords} icon={endIcon} />

                <Marker
                    position={currentPosition}
                    icon={movingIcon(rotationAngle)}
                />
            </MapContainer>
        </div>
    );
};

export default MapComponent;
