import React, { useState, useEffect } from 'react';
import MapView from './assets/components/MapView';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import './index.css';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    document.body.className = isDarkMode ? 'dark-theme' : 'light-theme';
  }, [isDarkMode]);

  return (
    <div className={`min-vh-100 d-flex flex-column ${isDarkMode ? 'bg-dark text-light' : 'bg-light text-dark'}`}>
      {/* Header */}
      <header className={`py-4 px-3 border-bottom ${isDarkMode ? 'bg-black text-white' : 'bg-white shadow-sm text-dark'}`}>
        <div className="container d-flex flex-column flex-md-row justify-content-between align-items-center">
          <div>
            <h1 className="h4 fw-bold mb-1 text-primary">Ruta A* en Querétaro</h1>
            <p className={`mb-0 small ${isDarkMode ? 'text-light' : 'text-muted'}`}>Portal de rutas y emergencias</p>
          </div>
          <div className="mt-3 mt-md-0">
            <label className="switch">
              <input type="checkbox" checked={isDarkMode} onChange={() => setIsDarkMode(!isDarkMode)} />
              <span className="slider"></span>
            </label>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-grow-1 p-3">
        <div className="container">
          <MapView isDarkMode={isDarkMode} />
        </div>
      </main>

      {/* Footer opcional */}
      <footer className={`py-3 text-center small ${isDarkMode ? 'text-light' : 'text-muted'}`}>
        Hecho con 💙 en Querétaro — {new Date().getFullYear()}
      </footer>

    </div>
  );
}

export default App;
