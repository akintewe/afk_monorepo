import React from 'react';
import ReactDOM from 'react-dom/client';

import StarknetProvider from './StarknetProvider.js';

import './index.css';
import App from './App';



const AppRender = ( ) => {
  return(
    <StarknetProvider>
      <App />
    </StarknetProvider>
  )
}
export { App, AppRender };

// const root = ReactDOM.createRoot(document.getElementById('root'));
// root.render(
//   <React.StrictMode>
//     <StarknetProvider>
//       <App />
//     </StarknetProvider>
//   </React.StrictMode>
// );