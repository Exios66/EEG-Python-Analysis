import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { ThemeToggle } from './components/ThemeToggle';
import VisualizationPanel from './components/VisualizationPanel';
import io from 'socket.io-client';

function App() {
  const [socket, setSocket] = useState(null);
  const [eegData, setEegData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    newSocket.on('eeg_data', (data) => {
      setEegData(data);
    });

    return () => newSocket.close();
  }, []);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      try {
        const response = await fetch('http://localhost:5000/api/eeg-data', {
          method: 'POST',
          body: formData,
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setEegData(data);
      } catch (error) {
        console.error('Error uploading EEG file:', error);
        setError('Failed to upload EEG file. Please try again.');
      }
    }
  };

  const processEEG = () => {
    if (socket) {
      socket.emit('process_eeg', {/* any data you want to send */});
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-white dark:bg-gray-900 text-black dark:text-white">
        <header className="p-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">EEG Visualization</h1>
          <ThemeToggle />
        </header>
        <main className="p-4">
          <input type="file" onChange={handleFileUpload} accept=".edf" />
          <button onClick={processEEG} className="mt-4 p-2 bg-blue-500 text-white rounded">
            Process EEG Data
          </button>
          {error ? (
            <p className="text-red-500">{error}</p>
          ) : eegData ? (
            <VisualizationPanel data={eegData} />
          ) : (
            <p>Upload an EEG file to visualize data</p>
          )}
        </main>
      </div>
    </ThemeProvider>
  );
}

export default App;
