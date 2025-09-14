import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './AppRoutes';
import './App.css'
import Loading from './components/Loading';
import { clientServer } from './config/clientServer';


function App() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [randomusers, setRandomusers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await clientServer.get('/');
        const data = res.data;
        setUser(data.user || null);
        setPosts(Array.isArray(data.posts) ? data.posts : []);
        setRandomusers(Array.isArray(data.randomusers) ? data.randomusers : []);
        // --- FIX: Set data-current-user-name on <body> for global access ---
        if (data.user && data.user.username) {
          document.body.setAttribute('data-current-user-name', data.user.username);
          window.__CURRENT_USER_NAME__ = data.user.username;
        }
      } catch (err) {
        if (err.response && err.response.status === 401) {
          // Not authenticated, redirect to login
          window.location.href = '/login';
        } else {
          setUser(null);
          setPosts([]);
          setRandomusers([]);
          document.body.removeAttribute('data-current-user-name');
          window.__CURRENT_USER_NAME__ = '';
        }
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <Loading />;

  // Ensure default values for props to avoid undefined errors
  const safeUser = user || {};
  const safePosts = Array.isArray(posts) ? posts : [];
  // Only use real users from backend, do not fallback to demo user
  const safeRandomusers = Array.isArray(randomusers) ? randomusers : [];
 



  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;
