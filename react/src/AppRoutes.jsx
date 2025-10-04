import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, Navigate, useLocation, useParams } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Home from './components/Home';
import Profile from './components/Profile';
import Premium from './components/Premium';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import EditProfile from './components/EditProfile';
import EditPost from './components/EditPost';
import Bookmarks from './components/Bookmarks';
import Settings from './components/Settings';
import Followers from './components/Followers';
import Following from './components/Following';
import NotFound from './components/NotFound';
import Loading from './components/Loading';
import ProfilePage from './components/ProfilePage';
import PostPartial from './components/PostPartial';
import NewPost from './components/NewPost';
import Post from './components/Post';
import Search from './components/Search';
import Messages from './components/Messages';
import NotificationPage from './components/NotificationPage';
import { clientServer  } from './config/clientServer';

function RequireAuth({ user, children }) {
  const location = useLocation();
  if (!user || !user._id) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

// Helper component to fetch a single post by ID and render <Post />
function PostPage({ currentUser }) {
  const { id } = useParams();
  const [post, setPost] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    async function fetchPost() {
      try {
        const data = await clientServer.get(`/api/post/${id}`);
        setPost(data.post || data);
      } catch (err) {
        setError('Post not found');
      } finally {
        setLoading(false);
      }
    }
    fetchPost();
  }, [id]);

  if (loading) return <div className="text-center text-gray-400 py-10">Loading post...</div>;
  if (error) return <div className="text-center text-red-500 py-10">{error}</div>;
  if (!post) return null;
  return <Post post={post} currentUser={currentUser} />;
}

function FollowersPage({ currentUser, randomusers }) {
  const { username } = useParams();
  const [followers, setFollowers] = React.useState([]);
  const [following, setFollowing] = React.useState([]);
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [followingState, setFollowingState] = React.useState({});
   React.useEffect(() => {
    setLoading(true);
    Promise.all([
      clientServer.get(`/api/profile/${username}/followers`).then(res => res.data),
      clientServer.get(`/api/profile/${username}/following`).then(res => res.data)
    ]).then(([followersData, followingData]) => {
      setFollowers(followersData.followers || []);
      setFollowing(followingData.following || []);
      setUser(followersData.user || followingData.user || null);
      
      // Set initial following state for each follower
      if (currentUser && currentUser.following) {
        const state = {};
        (followersData.followers || []).forEach(f => {
          state[f._id] = currentUser.following.includes(f._id);
        });
        setFollowingState(state);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [username, currentUser]);

  // Toggle follow/unfollow for a follower
  const onFollowToggle = async (followerUsername, followerId) => {
    if (!followerId) return;
    setFollowingState(prev => ({ ...prev, [followerId]: !prev[followerId] }));
    // Update followers list instantly
    setFollowers(prev => {
      if (followingState[followerId]) {
        // Unfollow: remove current user from followers
        return prev.filter(f => f._id !== currentUser._id);
      } else {
        // Follow: add current user to followers
        if (!prev.some(f => f._id === currentUser._id)) {
          return [...prev, { _id: currentUser._id, username: currentUser.username, profilePhoto: currentUser.profilePhoto, email: currentUser.email }];
        }
        return prev;
      }
    });
    await clientServer.post(`/api/profile/${followerUsername}/toggle-follow`);
  };

  if (loading) return <Loading />;
  if (!user) return <div className="text-center text-gray-400 py-10">User not found.</div>;
  return <Followers user={user} followers={followers} following={following} currentUser={currentUser} randomusers={randomusers} onFollowToggle={(username) => {
    const follower = followers.find(f => f.username === username);
    if (follower) onFollowToggle(username, follower._id);
  }} followingState={followingState} />;
}

function FollowingPage({ currentUser, randomusers }) {
  const { username } = useParams();
  const [following, setFollowing] = React.useState([]);
  const [followers, setFollowers] = React.useState([]);
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [followingState, setFollowingState] = React.useState({});
  React.useEffect(() => {
    setLoading(true);
    Promise.all([
      clientServer.get(`/api/profile/${username}/following`).then(res => res.data),
      clientServer.get(`/api/profile/${username}/followers`).then(res => res.data)
    ]).then(([followingData, followersData]) => {
      setFollowing(followingData.following || []);
      setFollowers(followersData.followers || []);
      setUser(followingData.user || followersData.user || null);
      // Set initial following state for each following
      if (currentUser && currentUser.following) {
        const state = {};
        (followingData.following || []).forEach(f => {
          state[f._id] = currentUser.following.includes(f._id);
        });
        setFollowingState(state);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [username, currentUser]);

  // Toggle follow/unfollow for a following
  const onFollowToggle = async (followingUsername, followingId) => {
    if (!followingId) return;
    setFollowingState(prev => ({ ...prev, [followingId]: !prev[followingId] }));
    // Update following list instantly
    setFollowing(prev => {
      if (followingState[followingId]) {
        // Unfollow: remove user from following
        return prev.filter(f => f._id !== followingId);
      } else {
        // Follow: add user to following
        const userToAdd = prev.find(f => f._id === followingId);
        if (!userToAdd) {
          // If not in list, add (fallback: just id)
          return [...prev, { _id: followingId }];
        }
        return prev;
      }
    });
    await clientServer.post(`/api/profile/${followingUsername}/toggle-follow`);
  };

  if (loading) return <Loading />;
  // Only show 'User not found' if user is truly missing or invalid
  if (!user || !user._id || !user.username) {
    return <div className="text-center text-gray-400 py-10">User not found.</div>;
  }
  return <Following user={user} following={following} followers={followers} currentUser={currentUser} randomusers={randomusers} onFollowToggle={(username) => {
    const followingUser = following.find(f => f.username === username);
    if (followingUser) onFollowToggle(username, followingUser._id);
  }} followingState={followingState} />;
}

function AppRoutes() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [randomusers, setRandomusers] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // On mount, check if user is authenticated (session)
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await clientServer.get('/api/users/me');
        console.log('DEBUG /api/users/me response:', res);
        if (res && res.data && res.data.user && res.data.user._id) {
          setUser(res.data.user);
        } else {
          setUser(null);
          if (
            window.location.pathname !== '/login' &&
            window.location.pathname !== '/register'
          ) {
            navigate('/login');
          }
        }
      } catch (err) {
        setUser(null);
        if (
          window.location.pathname !== '/login' &&
          window.location.pathname !== '/register'
        ) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
    // eslint-disable-next-line
  }, []);

  // Redirect to / if already logged in and on /login or /register
  useEffect(() => {
    if (user && user._id && (window.location.pathname === '/login' || window.location.pathname === '/register')) {
      if (window.location.pathname !== '/') {
        navigate('/', { replace: true });
      }
    }
  }, [user, navigate]);

  // SearchPage component for /user/search
  function SearchPage() {
    const location = useLocation();
    const [results, setResults] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const params = new URLSearchParams(location.search);
    const q = params.get('q') || '';

    React.useEffect(() => {
      if (!q) {
        setResults([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      clientServer.get(`/api/search?q=${encodeURIComponent(q)}`)
        .then(res => {
          setResults(Array.isArray(res.data?.results) ? res.data.results : []);
          setLoading(false);
          console.log('Search results:', res.data?.results);
          console.log('Search query:', q);
        })
        .catch(() => {
          setResults([]);
          setLoading(false);
        });
    }, [q]);

    const handleProfileClick = (username) => {
      navigate(`/profile/${username}`);
    };

    if (loading) return <Loading />;
    return <Search results={results} onProfileClick={handleProfileClick} />;
  }

  // Fetch posts and randomusers after user is set
  useEffect(() => {
    if (!user || !user._id) return;
    async function fetchData() {
      try {
        const data = await clientServer.get('/');
        setPosts(Array.isArray(data.posts) ? data.posts : []);
        let randomList = [];
        if (Array.isArray(data.randomusers) && data.randomusers.length > 0) {
          randomList = data.randomusers;
        } else {
          // Fallback: get all users, filter out current user, shuffle
          const usersRes = await clientServer.get('/api/users');
          let users = Array.isArray(usersRes.data.users) ? usersRes.data.users : [];
          users = users.filter(u => u._id !== user._id);
          // Shuffle users for randomness
          for (let i = users.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [users[i], users[j]] = [users[j], users[i]];
          }
          // Limit to 10 random users
          randomList = users.slice(0, 10);
        }
        setRandomusers(randomList);
      } catch (err) {
        setPosts([]);
        // fallback: fetch random users from /api/users
        let randomList = [];
        try {
          const usersRes = await clientServer.get('/api/users');
          let users = Array.isArray(usersRes.data.users) ? usersRes.data.users : [];
          users = users.filter(u => u._id !== user._id);
          for (let i = users.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [users[i], users[j]] = [users[j], users[i]];
          }
          randomList = users.slice(0, 10);
        } catch {}
        setRandomusers(randomList);
      }
    }
    fetchData();
  }, [user]);

  // Fetch bookmarks when /bookmarks route is active
  useEffect(() => {
    if (window.location.pathname === '/bookmarks') {
      clientServer.get('/api/bookmarks')
        .then(data => {
          setBookmarks(Array.isArray(data.posts) ? data.posts : []);
        });
    }
  }, [window.location.pathname]);


  // Premium expiry state
  const [premiumExpiry, setPremiumExpiry] = useState("");
  useEffect(() => {
    async function fetchPremiumExpiry() {
      try {
        const res = await clientServer.get('/premium');
        if (res.data && res.data.verificationExpiresAt) {
          setPremiumExpiry(res.data.verificationExpiresAt);
        } else {
          setPremiumExpiry("");
        }
      } catch {
        setPremiumExpiry("");
      }
    }
    if (user && user._id) fetchPremiumExpiry();
  }, [user]);

  // Ensure default values for props to avoid undefined errors
  const safeUser = user || {};
  const safePosts = Array.isArray(posts) ? posts : [];
  const safeRandomusers = Array.isArray(randomusers) ? randomusers : [];

  useEffect(() => {
    console.log("Random Users:", safeRandomusers);
  }, [safeRandomusers]);

  if (loading) return <Loading />;

  // Handler for login
  const handleLogin = (userData) => {
    setUser(userData);
    // Use .then() to ensure navigation completes before reload
    Promise.resolve()
      .then(() => navigate('/', { replace: true }))
      .then(() => {
       
          window.location.reload();
      
      });
  };

  // Handler for register (autologin and redirect to /)
  const handleRegister = (userData) => {
    setUser(userData);
    // Navigation is handled by useEffect to avoid double navigation
  };

  // Handler for logout
  const handleLogout = async () => {
    try {
      await clientServer.get('/logout');
     
    } catch (err) {}
    setUser(null);
    // Always redirect to /login after logout
    if (window.location.pathname !== '/login') {
      navigate('/login');
    }
  };

  // Handler for delete account
  const handleDeleteAccount = async () => {
    try {
      await clientServer.post('/delete-account');
    } catch (err) {}
    setUser(null);
    navigate('/login');
  };

  // Handler for edit profile save
  const handleEditProfileSave = async (form) => {
    // Prepare form data for file upload
    const formData = new FormData();
    formData.append('username', form.username);
    formData.append('email', form.email);
    if (form.profilePhoto) formData.append('Image', form.profilePhoto);
    if (form.coverPhoto) formData.append('cover', form.coverPhoto);
    try {
      const data = await clientServer.post('/profile/edit', formData, { 
        headers: { 
          'Accept': 'application/json',
          'Content-Type': undefined // Let axios set this for FormData
        } 
      });
      if (data && data.user && data.user.username) {
        setUser(data.user); // update user state
        navigate(`/profile/${data.user.username}`);
        return;
      }
      // fallback: use form.username
      navigate(`/profile/${form.username}`);
    } catch (err) {
      // fallback: use form.username
      navigate(`/profile/${form.username}`);
    }
  };

  // Handler for edit profile cancel
  const handleEditProfileCancel = () => {
    if (user && user.username) {
      navigate(`/profile/${user.username}`);
    }
  };

  return (
    <Routes>
      <Route path="/login" element={<Login onLogin={handleLogin} />} />
      <Route path="/register" element={<Register onRegister={handleRegister} />} />
      <Route path="/" element={
        <RequireAuth user={safeUser}>
          <Home user={safeUser} posts={safePosts} randomusers={safeRandomusers} />
        </RequireAuth>
      } />
      <Route path="/user/search" element={<SearchPage />} />
      <Route path="/premium" element={
        <RequireAuth user={safeUser}>
          <Premium
            user={safeUser}
            verificationExpiresAt={premiumExpiry}
            onUpgrade={async (e) => {
              e.preventDefault();
              try {
                await clientServer.post('/premium');
                window.location.reload();
              } catch (err) {
                alert('Upgrade failed.');
              }
            }}
          />
        </RequireAuth>
      } />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/profile/:username" element={
        <RequireAuth user={safeUser}>
          <ProfilePage currentUser={safeUser} randomusers={safeRandomusers} onFollowToggle={() => {}} />
        </RequireAuth>
      } />
      <Route path="/profile/:username/following" element={
        <RequireAuth user={safeUser}>
          <FollowingPage currentUser={safeUser} randomusers={safeRandomusers} />
        </RequireAuth>
      } />
      <Route path="/profile/:username/followers" element={
        <RequireAuth user={safeUser}>
          <FollowersPage currentUser={safeUser} randomusers={safeRandomusers} />
        </RequireAuth>
      } />
      <Route path="/profile/:id/edit" element={
        <RequireAuth user={safeUser}>
          <EditProfile user={safeUser} onSave={handleEditProfileSave} onCancel={handleEditProfileCancel} />
        </RequireAuth>
      } />
      {/* Edit Post Route */}
      <Route path="/post/:id/edit" element={
        <RequireAuth user={safeUser}>
          <EditPost user={safeUser} />
        </RequireAuth>
      } />
      <Route path="/bookmarks" element={
        <RequireAuth user={safeUser}>
          <Bookmarks user={safeUser} posts={bookmarks} PostPartial={PostPartial} />
        </RequireAuth>
      } />
      {/* Messages Route */}
      <Route path="/messages" element={
        <RequireAuth user={safeUser}>
          <Messages />
        </RequireAuth>
      } />
      <Route path="/notifications" element={
        <RequireAuth user={safeUser}>
          <NotificationPage user={safeUser} randomusers={safeRandomusers} />
        </RequireAuth>
      } />
      <Route path="/:id/settings" element={
        <RequireAuth user={safeUser}>
          <Settings user={safeUser} onDeleteAccount={handleDeleteAccount} onLogout={handleLogout} />
        </RequireAuth>
      } />
      <Route path="/post/:id" element={
        <RequireAuth user={safeUser}>
          <PostPage currentUser={safeUser} />
        </RequireAuth>
      } />
      <Route path="/post/new" element={
        <RequireAuth user={safeUser}>
          <NewPost
            onSubmit={async ({ content, image }) => {
              const formData = new FormData();
              formData.append('content', content);
              if (image) formData.append('image', image);
              try {
                console.log('🚀 Submitting new post:', { content, hasImage: !!image, imageType: image?.type, imageSize: image?.size });
                const data = await clientServer.post('/api/post/new', formData, { 
                  headers: { 
                    'Accept': 'application/json',
                    // Remove Content-Type to let axios set it automatically for FormData
                    'Content-Type': undefined
                  } 
                });
                console.log('✅ Post creation response:', data);
                if (data && data.data && data.data.post && data.data.post._id) {
                  navigate(`/post/${data.data.post._id}`);
                  return;
                }
                // fallback: go home
                navigate('/');
              } catch (err) {
                console.error('❌ Post creation error:', err);
                navigate('/');
              }
            }}
            onCancel={() => navigate(-1)}
          />
        </RequireAuth>
      } />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;
