import React from 'react';
import './app.scss';
import { AppProvider } from './store/appContext';

function App({ children }: { children: any }) {
  return <AppProvider>{children}</AppProvider>;
}

export default App;
