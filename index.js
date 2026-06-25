import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // This is the crucial line
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

function App() {
  return (
    <div className="flex justify-center items-center h-screen bg-blue-500">
      <h1 className="text-4xl font-bold text-white">
        Hello, Tailwind CSS!
      </h1>
    </div>
  );
}

export default App;