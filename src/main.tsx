import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Global error handler for unhandled errors
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found. Make sure there is a div with id="root" in your HTML.');
}

try {
  const root = createRoot(rootElement);
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
} catch (error) {
  console.error('Failed to render React app:', error);
  
  // Fallback error display
  rootElement.innerHTML = `
    <div style="
      display: flex; 
      flex-direction: column; 
      align-items: center; 
      justify-content: center; 
      min-height: 100vh; 
      font-family: Arial, sans-serif;
      text-align: center;
      padding: 20px;
    ">
      <h1 style="color: #d32f2f; margin-bottom: 16px;">Application Error</h1>
      <p style="color: #666; margin-bottom: 24px; max-width: 600px;">
        The electrical calculator failed to load. This might be due to a browser compatibility issue 
        or network problem. Please try refreshing the page or using a different browser.
      </p>
      <button 
        onclick="window.location.reload()" 
        style="
          background: #1976d2; 
          color: white; 
          border: none; 
          padding: 12px 24px; 
          border-radius: 4px; 
          cursor: pointer;
          font-size: 16px;
        "
      >
        Reload Page
      </button>
    </div>
  `;
}
