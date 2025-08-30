import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { observer } from 'mobx-react-lite'
import { authStore } from './stores/auth'
import { ErrorBoundary } from './components/ErrorBoundary';

export default observer(function App() {
  const nav = useNavigate();
  const loc = useLocation();
  const token = authStore.token;
  if (!token && loc.pathname !== '/login') {
    nav('/login', { replace: true });
  }

  const logout = () => { authStore.logout(); nav('/login'); };

  return (
    <ErrorBoundary>
      <div className="container">
        <header className="header">
          <h2>TODO App</h2>
          {token && <button className="btn" onClick={logout}>Выйти</button>}
        </header>
        <Outlet />
      </div>
    </ErrorBoundary>
  )
})
