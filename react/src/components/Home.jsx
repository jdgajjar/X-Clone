import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  fetchPosts,
  toggleLike,
  toggleBookmark,
} from '../utils/api';

import HomeHead from './HomeHead';
import HomeSidebar from './HomeSidebar';
import HomeRightSidebar from './HomeRightSidebar';
import HomeReplyModal from './HomeReplyModal';
import HomeShareModal from './HomeShareModal';
import './popAnimation.css';
import { clientServer } from '../config/clientServer';
import './mobileSidebar.css';

const Home = ({ user, posts: initialPosts = [], randomusers: initialRandomusers = [] }) => {
  const [posts, setPosts] = useState(initialPosts);
  const [randomusers, setRandomusers] = useState(initialRandomusers);

  // Keep local randomusers in sync with prop
  useEffect(() => {
    setRandomusers(Array.isArray(initialRandomusers) ? initialRandomusers.slice(0, 10) : []);
  }, [initialRandomusers]);
  const [replyModal, setReplyModal] = useState({ visible: false, postId: null, username: '', isVerified: false });
  const [shareModal, setShareModal] = useState({ visible: false, postId: null, username: '', postLink: '', userList: [] });
  const [shareSuccess, setShareSuccess] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const postsData = await fetchPosts();

        const bookmarks = (user?.bookmarks || []).map(id => id.toString());
        const updatedPosts = postsData.map(post => ({
          ...post,
          isBookmarked: bookmarks.includes(post._id?.toString()),
        }));

        setPosts(updatedPosts);
        setRandomusers(initialRandomusers); // You can also fetch this separately if needed
     
        
      } catch (err) {
        console.error('Failed to load posts:', err);
      }
    };

    loadPosts();
  }, []);

  const handleLike = async (postId) => {
    try {
      const data = await toggleLike(postId);
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post._id === postId
            ? {
                ...post,
                likes: Array.from({ length: data.likesCount }, () => ({})),
              }
            : post
        )
      );
    } catch (err) {
      console.error('Failed to like post:', err.message);
    }
  };

  const handleBookmark = async (postId) => {
    try {
      const data = await toggleBookmark(postId);
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post._id === postId
            ? { ...post, isBookmarked: data.isBookmarked }
            : post
        )
      );
    } catch (err) {
      console.error('Failed to bookmark post:', err.message);
    }
  };

  const handleToggleReplyModal = (postId, username, isVerified) => {
    setReplyModal({ visible: true, postId, username, isVerified });
  };

  const handleToggleShareModal = async (postId, username) => {
    const postLink = `${window.location.origin}/post/${postId}`;
    try {
      const res = await clientServer.get('/api/users');
      const userList = Array.isArray(res.data.users) ? res.data.users : [];
      setShareModal({
        visible: true,
        postId,
        username,
        postLink,
        userList,
      });
    } catch (e) {
      setShareModal({
        visible: true,
        postId,
        username,
        postLink,
        userList: [],
      });
    }
  };

  const handleProfileClick = (username) => {
    if (username) navigate(`/profile/${username}`);
  };

  const handleToggleMobileNav = () => {
    if (window.innerWidth < 768) {
      setMobileSidebarOpen(true);
    }
  };

  const handleCloseMobileNav = () => setMobileSidebarOpen(false);

  // Handler for when share is successful
  const handleShareSuccess = () => {
    setShareSuccess(true);
    setShareModal((prev) => ({ ...prev, visible: false }));
    setTimeout(() => setShareSuccess(false), 2000);
  };

  return (
    <div className="antialiased bg-black text-white font-sans min-h-screen" data-current-user-name={user?.username || ''}>
      <div className="fixed top-0 left-0 w-full bg-black z-50">
        <HomeHead onToggleMobileNav={handleToggleMobileNav} />
      </div>

      <div className="flex min-h-screen mt-[55px] max-w-7xl mx-auto">
        <aside className="md:w-[275px] lg:w-[300px] xl:w-[340px] w-fit z-0">
          <div className="fixed bottom-0 md:h-screen py-0 md:py-2 w-fit z-0">
            <div className="flex md:flex-col h-16 md:h-full overflow-y-auto">
              <HomeSidebar user={user} />
            </div>
          </div>
        </aside>

        <main className="flex-grow border-x border-gray-800 min-h-screen md:max-w-[600px]">
          <div id="dynamic-content">
            <div className="border-b border-gray-800 p-4">
              {Array.isArray(posts) && posts.length > 0 ? posts.map(post => (
                <div className="flex space-x-3 mb-6" key={post._id}>
                  <div className="w-12 h-12 rounded-full border-2 overflow-hidden bg-gray-900">
                    <img src={post.author?.profilePhoto?.url || '/default-profile.png'} alt="profile" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-grow relative">
                    <button
                      className={`absolute top-0 right-0 p-2 ${post.isBookmarked ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-400'}`}
                      onClick={() => handleBookmark(post._id)}
                      title={post.isBookmarked ? 'Remove Bookmark' : 'Add Bookmark'}
                    >
                      <span className="material-symbols-outlined" style={post.isBookmarked ? { fontVariationSettings: '"FILL" 1' } : {}}>
                        bookmark
                      </span>
                    </button>
                    <div onClick={() => handleProfileClick(post.author.username)} className="cursor-pointer">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold hover:underline flex items-center">
                          {post.author.username}
                          {post.author.IsVerified && (
                            <svg width="20" height="20" viewBox="0 0 50 50" className="ml-1">
                              <path
                                fill="#1DA1F2"
                                d="M45.103,24.995l3.195-6.245l-5.892-3.807l-0.354-7.006l-7.006-0.35l-3.81-5.89l-6.242,3.2l-6.245-3.196l-3.806,5.893 
                                  L7.938,7.948l-0.352,7.007l-5.89,3.81l3.2,6.242L1.702,31.25l5.892,3.807l0.354,7.006l7.006,0.35l3.81,5.891l6.242-3.2l6.245,3.195 
                                  l3.806-5.893l7.005-0.354l0.352-7.006l5.89-3.81L45.103,24.995z M22.24,32.562l-6.82-6.819l2.121-2.121l4.732,4.731l10.202-9.888 
                                  l2.088,2.154L22.24,32.562z"
                              />
                            </svg>
                          )}
                        </span>
                        <span className="text-gray-500 text-sm">
                          {new Date(post.createdAt).toLocaleString('en-US', { weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: true })}
                        </span>
                      </div>
                    </div>
                    <p className="mt-1">{post.content}</p>
                    {post.image && (
                      <div className="mt-2">
                        <img src={post.image.url} alt="Post" className="rounded-lg max-h-80 w-auto object-cover" />
                      </div>
                    )}
                    <div className="flex justify-between mt-2">
                      <button className="flex items-center space-x-1 text-gray-500 hover:text-red-500" onClick={() => handleLike(post._id)}>
                        <span className="material-symbols-outlined">favorite</span>
                        <span>{post.likes.length}</span>
                      </button>
                      <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-500" onClick={() => handleToggleReplyModal(post._id, post.author.username, post.author.IsVerified)}>
                        <span className="material-symbols-outlined">comment</span>
                        <span>{post.replies?.length || 0}</span>
                      </button>
                      <button className="flex items-center space-x-1 text-gray-500 hover:text-green-500" onClick={() => handleToggleShareModal(post._id, post.author.username)}>
                        <span className="material-symbols-outlined">share</span>
                        <span>Share</span>
                      </button>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="p-8 text-center text-gray-500">No posts found</div>
              )}
            </div>
          </div>
        </main>

        <aside className="right-sidebar hidden-desktop lg:block lg:w-[350px] xl:w-[390px] border-l border-gray-700">
          <HomeRightSidebar user={user} randomusers={randomusers} />
        </aside>
      </div>

      {replyModal.visible && (
        <HomeReplyModal
          postId={replyModal.postId}
          postAuthorUsername={replyModal.username}
          isVerified={replyModal.isVerified}
          onClose={() => setReplyModal({ visible: false })}
        />
      )}

      {shareModal.visible && (
        <HomeShareModal
          postId={shareModal.postId}
          postAuthorUsername={shareModal.username}
          postLink={shareModal.postLink}
          userList={shareModal.userList}
          onClose={() => setShareModal({ visible: false })}
          onShareSuccess={handleShareSuccess}
        />
      )}
      <div className={`share-success-popup${shareSuccess ? ' show' : ''}`}>Post sent successfully!</div>

      <div
        id="mobile-nav-sidebar"
        className={`fixed inset-0 z-50 md:hidden ${mobileSidebarOpen ? 'open' : 'closed'}`}
        style={{ pointerEvents: mobileSidebarOpen ? 'auto' : 'none' }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-80 mobile-sidebar-overlay" onClick={handleCloseMobileNav} />
        <div className="absolute top-0 left-0 h-full w-3/4 max-w-xs bg-black z-10 p-6 mobile-sidebar-content">
          <button onClick={handleCloseMobileNav} className="absolute top-4 right-4 text-gray-400 hover:text-white text-3xl">
            <span className="material-symbols-outlined">close</span>
          </button>
          <div className="mt-12 w-full">
            <button className="block w-full py-4 px-6 rounded-lg text-white text-lg font-semibold hover:bg-gray-800" onClick={() => { setMobileSidebarOpen(false); navigate('/bookmarks'); }}>
              <span className="material-symbols-outlined align-middle mr-3">bookmarks</span> Bookmarks
            </button>
            <button className="block w-full py-4 px-6 rounded-lg text-white text-lg font-semibold hover:bg-gray-800" onClick={() => { setMobileSidebarOpen(false); navigate('/premium'); }}>
              <span className="material-symbols-outlined align-middle mr-3">box</span> Premium
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
