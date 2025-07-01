import { MapContainer, TileLayer, Marker, Polyline, Popup, Tooltip, useMapEvents } from 'react-leaflet';
import { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const startIcon = new L.Icon({ iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png', iconSize: [32, 32], iconAnchor: [16, 32] });
const endIcon = new L.Icon({ iconUrl: 'https://cdn-icons-png.flaticon.com/512/1673/1673221.png', iconSize: [32, 32], iconAnchor: [16, 32] });
const midIcon = new L.Icon({ iconUrl: 'https://cdn-icons-png.flaticon.com/512/149/149059.png', iconSize: [28, 28], iconAnchor: [14, 28] });
const obstacleIcon = new L.Icon({ iconUrl: 'https://cdn-icons-png.flaticon.com/512/463/463612.png', iconSize: [28, 28], iconAnchor: [14, 28] });

const MapView = ({ isDarkMode }) => {
  const [waypoints, setWaypoints] = useState([]);
  const [obstacles, setObstacles] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [blockMode, setBlockMode] = useState(false);
  const [distancia, setDistancia] = useState(null);
  const [duracion, setDuracion] = useState(null);

  const MapClick = () => {
    useMapEvents({
      click: async e => {
        const { lat, lng } = e.latlng;
        if (blockMode) {
          setObstacles([...obstacles, [lat, lng]]);
          setBlockMode(false);
        } else {
          setWaypoints([...waypoints, { id: Date.now(), pos: [lat, lng], label: '' }]);
        }
      }
    });
    return null;
  };

  const onDragEnd = result => {
    if (!result.destination) return;
    const items = Array.from(waypoints);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);
    setWaypoints(items);
  };

  const updateLabel = (id, text) => {
    setWaypoints(waypoints.map(w => w.id === id ? { ...w, label: text } : w));
  };

  const removePoint = id => {
    setWaypoints(waypoints.filter(w => w.id !== id));
  };

  const resetRoute = () => {
    setWaypoints([]);
    setObstacles([]);
    setRoutes([]);
    setDistancia(null);
    setDuracion(null);
  };

  const fetchRoute = async () => {
    if (waypoints.length < 2) return alert('Agrega al menos dos puntos');
    const data = {
      waypoints: waypoints.map(w => w.pos),
      obstacles
    };
    try {
      const res = await axios.post(import.meta.env.VITE_API_URL + '/route', data);

      setRoutes(res.data.routes);
      setDistancia(res.data.distancia);
      setDuracion(res.data.duracion);
    } catch {
      alert('Error al calcular la ruta');
    }
  };

  return (
    <div className="container mt-3">

      <div className={`card mb-3 p-3 shadow-sm ${isDarkMode ? 'bg-dark text-light' : 'bg-white text-dark'}`}>
        <h4 className="mb-2">ℹ️ ¿Cómo usar el mapa?</h4>
        <ul className="mb-0 ps-3">
          <li>🖱️ <strong>Haz clic</strong> en el mapa para agregar un punto</li>
          <li>🧩 <strong>Arrastra</strong> los puntos para reordenar la ruta</li>
          <li>📝 <strong>Escribe</strong> etiquetas para cada punto (inicio, parada, fin)</li>
          <li>🚧 <strong>Agrega bloqueos</strong> (clic en "Agregar bloqueo" y luego en el mapa)</li>
          <li>🛠️ <strong>Arrastra</strong> los bloqueos para moverlos</li>
          <li>🗑️ <strong>Clic derecho</strong> o usa el botón para eliminarlos</li>
          <li>✅ <strong>Haz clic en "Calcular ruta"</strong> para ver el camino óptimo</li>
          <li>🔄 <strong>Reinicia</strong> la ruta para comenzar de nuevo</li>
        </ul>
      </div>

      <div className={`card p-3 mb-3 shadow ${isDarkMode ? 'dark-card' : ''}`}>
        <h3 className="mb-3">🧩 Puntos y etiquetas</h3>

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="waypoints">
            {provided => (
              <ul className="list-group" {...provided.droppableProps} ref={provided.innerRef}>
                {waypoints.map((w, i) => (
                  <Draggable key={w.id} draggableId={w.id.toString()} index={i}>
                    {prov => (
                      <li
                        className={`list-group-item d-flex align-items-center ${isDarkMode ? 'dark-list-item' : ''}`}
                        ref={prov.innerRef}
                        {...prov.draggableProps}
                        {...prov.dragHandleProps}
                      >
                        <input
                          className={`form-control me-2 ${isDarkMode ? 'dark-input' : ''}`}
                          placeholder={i === 0 ? 'Inicio' : i === waypoints.length - 1 ? 'Fin' : 'Parada'}
                          value={w.label}
                          onChange={e => updateLabel(w.id, e.target.value)}
                        />
                        <button className="btn btn-danger btn-sm" onClick={() => removePoint(w.id)}>❌</button>
                      </li>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </ul>
            )}
          </Droppable>
        </DragDropContext>

        <div className="mt-3 d-flex gap-2 flex-wrap">
          <button className="btn btn-warning" onClick={() => setBlockMode(true)}>🚧 Agregar bloqueo</button>
          <button className="btn btn-success" onClick={fetchRoute}>Calcular ruta</button>
          <button className="btn btn-outline-danger" onClick={resetRoute}>🗑️ Reiniciar ruta</button>
        </div>
      </div>

      {distancia && duracion && (
        <div className="alert alert-info">
          📏 Distancia: <strong>{distancia} m</strong>, ⏱ Duración: <strong>{duracion} min</strong>
        </div>
      )}

      <div style={{ height: "600px" }}>
        <MapContainer center={[20.5888, -100.3899]} zoom={17} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url={
              isDarkMode
                ? 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png'
                : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            }
          />
          <MapClick />
          {waypoints.map((w, i) => (
            <Marker
              key={w.id}
              position={w.pos}
              draggable
              eventHandlers={{
                dragend: e => {
                  const { lat, lng } = e.target.getLatLng();
                  setWaypoints(ws => ws.map(p => p.id === w.id ? { ...p, pos: [lat, lng] } : p));
                }
              }}
              icon={i === 0 ? startIcon : i === waypoints.length - 1 ? endIcon : midIcon}
            >
              <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                {w.label || (i === 0 ? 'Inicio' : i === waypoints.length - 1 ? 'Fin' : `Parada ${i}`)}
              </Tooltip>
              <Popup>
                <input
                  className={`form-control ${isDarkMode ? 'dark-input' : ''}`}
                  placeholder="Etiqueta"
                  value={w.label}
                  onChange={e => updateLabel(w.id, e.target.value)}
                />
              </Popup>
            </Marker>
          ))}
          {obstacles.map((pos, idx) => (
            <Marker
              key={`obs-${idx}`}
              position={pos}
              icon={obstacleIcon}
              draggable
              eventHandlers={{
                dragend: (e) => {
                  const { lat, lng } = e.target.getLatLng();
                  setObstacles((prev) => {
                    const newObstacles = [...prev];
                    newObstacles[idx] = [lat, lng];
                    return newObstacles;
                  });
                },
                contextmenu: () => {
                  // Eliminar al hacer clic derecho
                  setObstacles((prev) => prev.filter((_, i) => i !== idx));
                }
              }}
            >
              <Popup>
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => setObstacles((prev) => prev.filter((_, i) => i !== idx))}
                >
                  🗑️ Eliminar bloqueo
                </button>
              </Popup>
            </Marker>

          ))}

          {routes.map((coords, i) => (
            <Polyline
              key={i}
              positions={coords}
              color={i === 0 ? 'green' : 'gray'}
              weight={i === 0 ? 6 : 4}
              opacity={i === 0 ? 0.9 : 0.5}
            />
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default MapView;
