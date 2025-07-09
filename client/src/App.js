import React, { useEffect } from 'react';
import './App.css';
import Sidenav from './components/SideNav';
import StateProvider from './components/providers/StateProvider';
import Login from './pages/Login';
import './App.css';
import { useSelector } from 'react-redux';
import axios from 'axios';

// ✅ Configura axios para enviar cookies e definir a baseURL da API
axios.defaults.withCredentials = true;
axios.defaults.baseURL = process.env.REACT_APP_BACKEND_URL;

function App() {
  const userState = useSelector((state) => {
    return state.user;
  });

  return (
    <>
      {!!!userState.id ? (
        <Login />
      ) : (
        <div className="app">
          <StateProvider>
            <Sidenav />
          </StateProvider>
        </div>
      )}
    </>
  );
}

export default App;
