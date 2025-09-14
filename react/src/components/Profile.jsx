import React, { useState } from "react";
import ProfileMain from "./ProfileMain";
import HomeSidebar from "./HomeSidebar";
import HomeHead from "./HomeHead";
import HomeRightSidebar from "./HomeRightSidebar";
import HomeReplyModal from "./HomeReplyModal";
import { toggleLike } from '../utils/api';
import { useNavigate } from 'react-router-dom';

const Profile = ({ user, posts = [], followers = [], following = [], currentUser, onEditProfile, onFollowToggle, randomusers = [], isFollowing }) => {
  const isCurrentUser = currentUser && currentUser._id === user._id;
  // Use isFollowing from props if provided, else fallback to currentUser.following
  const followingState = typeof isFollowing === 'boolean' ? isFollowing : (currentUser && currentUser.following && currentUser.following.includes(user._id));
  const [profilePosts, setProfilePosts] = useState(posts);
  const [replyModal, setReplyModal] = useState({ visible: false, postId: null, username: '', isVerified: false });
  const navigate = useNavigate();

  // Like handler for profile posts
  const handleLike = async (post) => {
    try {
      const data = await toggleLike(post._id);
      setProfilePosts((prevPosts) =>
        prevPosts.map((p) =>
          p._id === post._id
            ? { ...p, likes: Array(data.likesCount).fill({}) }
            : p
        )
      );
    } catch (err) {
      console.error('Failed to like post', err);
    }
  };

  // Open comment modal for profile posts
  const handleReply = (post) => {
    setReplyModal({ visible: true, postId: post._id, username: post.author?.username, isVerified: post.author?.IsVerified });
  };

  return (
    <div className="antialiased bg-black text-white font-sans min-h-screen" data-current-user-name={user?.username || ''}>
      {/* Header/Navbar */}
      <div className="fixed top-0 left-0 w-full bg-black z-50">
        <HomeHead />
      </div>
      {/* Layout */}
      <div className="flex min-h-screen mt-[55px] max-w-7xl mx-auto">
        {/* Sidebar - Left */}
        <aside className="md:w-[275px] lg:w-[300px] xl:w-[340px] w-fit z-0">
          <div className="fixed bottom-0 md:h-screen py-0 md:py-2 w-fit z-0">
            <div className="flex md:flex-col h-16 md:h-full overflow-y-auto">
              <HomeSidebar user={currentUser || user} />
            </div>
          </div>
        </aside>
        {/* Main Content */}
        <main className="flex-grow border-x border-gray-800 min-h-screen md:max-w-[600px]">
          {/* Profile Header */}
          <div className="sticky top-0 z-30 bg-black/90 backdrop-blur-md">
            <div className="flex items-center px-4 h-14">
              <button onClick={() => window.history.back()} className="p-2 rounded-full hover:bg-gray-800 transition-colors">
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
              <div className="ml-6">
                <h1 className="font-bold text-xl flex items-center gap-1">
                  <span className="flex items-center">
                    {user.username}
                    {user.IsVerified && (
                      <span title="Verified" className="ml-1 flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          x="0px"
                          y="0px"
                          width="20"
                          height="20"
                          viewBox="0 0 50 50"
                          className="inline-block align-middle ml-1 "
                          style={{ verticalAlign: "middle" }}
                        >
                          <path
                            fill="#1DA1F2"
                            d="M45.103,24.995l3.195-6.245l-5.892-3.807l-0.354-7.006l-7.006-0.35l-3.81-5.89l-6.242,3.2l-6.245-3.196l-3.806,5.893 L7.938,7.948l-0.352,7.007l-5.89,3.81l3.2,6.242L1.702,31.25l5.892,3.807l0.354,7.006l7.006,0.35l3.81,5.891l6.242-3.2l6.245,3.195 l3.806-5.893l7.005-0.354l0.352-7.006l5.89-3.81L45.103,24.995z M22.24,32.562l-6.82-6.819l2.121-2.121l4.732,4.731l10.202-9.888 l2.088,2.154L22.24,32.562z"
                          ></path>
                        </svg>
                      </span>
                    )}
                  </span>
                </h1>
                <p className="text-gray-500 text-sm">{posts.length} posts</p>
              </div>
            </div>
          </div>
          {/* Profile Info */}
          <div className="border-b border-gray-800">
            {/* Cover Image */}
            <div className="h-48 bg-gray-800">
              <img
                className="w-full h-48 object-cover"
                style={{ objectFit: 'cover', height: '12rem' }}
                src={user.coverPhoto?.url || 'https://res.cloudinary.com/dkqd9ects/image/upload/v1747571508/cover_image_hnvoqn.webp'}
                alt="Cover"
                onError={e => {e.target.onerror=null; e.target.src='https://res.cloudinary.com/dkqd9ects/image/upload/v1747571508/cover_image_hnvoqn.webp';}}
              />
            </div>
            {/* Profile Details */}
            <div className="px-4 pb-3">
              <div className="flex justify-between items-start -mt-16">
                {/* Profile Image */}
                <div className="w-32 h-32 rounded-full border-4 border-black bg-blue-500 flex items-center justify-center overflow-hidden shadow-lg" style={{ marginTop: '-4rem' }}>
                  <img src={user.profilePhoto?.url || 'https://res.cloudinary.com/dkqd9ects/image/upload/v1747571510/profile_offakc.png'} alt="Profile Photo" className="w-full h-full object-cover rounded-full border-4 border-white" onError={e => {e.target.onerror=null; e.target.src='https://res.cloudinary.com/dkqd9ects/image/upload/v1747571510/profile_offakc.png';}} />
                </div>
                {/* Edit Profile / Follow Button */}
                {isCurrentUser ? (
                  <button onClick={onEditProfile} className="mt-4 px-4 py-1.5 bg-slate-900 border border-gray-600 rounded-full font-bold hover:bg-gray-800 transition-colors edit-profile-button">
                    Edit profile
                  </button>
                ) : (
                  <button
                    className={`mt-4 px-4 py-1.5 rounded-full font-bold transition-colors follow-button ${followingState ? 'bg-blue-500 text-white' : 'bg-gray-700 text-white'}`}
                    onClick={onFollowToggle}
                  >
                    {followingState ? 'Unfollow' : 'Follow'}
                  </button>
                )}
              </div>
              {/* User Info */}
              <div className="mt-4">
                <h2 className="font-bold text-xl flex items-center gap-1">
                  <span className="flex items-center">
                    {user.username}
                    {user.IsVerified && (
                      <span title="Verified" className="ml-1 flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          x="0px"
                          y="0px"
                          width="20"
                          height="20"
                          viewBox="0 0 50 50"
                          className="inline-block align-middle ml-1 "
                          style={{ verticalAlign: "middle" }}
                        >
                          <path
                            fill="#1DA1F2"
                            d="M45.103,24.995l3.195-6.245l-5.892-3.807l-0.354-7.006l-7.006-0.35l-3.81-5.89l-6.242,3.2l-6.245-3.196l-3.806,5.893 L7.938,7.948l-0.352,7.007l-5.89,3.81l3.2,6.242L1.702,31.25l5.892,3.807l0.354,7.006l7.006,0.35l3.81,5.891l6.242-3.2l6.245,3.195 l3.806-5.893l7.005-0.354l0.352-7.006l5.89-3.81L45.103,24.995z M22.24,32.562l-6.82-6.819l2.121-2.121l4.732,4.731l10.202-9.888 l2.088,2.154L22.24,32.562z"
                          ></path>
                        </svg>
                      </span>
                    )}
                  </span>
                </h2>
                <p className="text-gray-500">@{user.email ? user.email.split('@')[0] : user.username}</p>
                {user.bio && <p className="mt-3">{user.bio}</p>}
                <div className="flex items-center gap-4 mt-3 text-gray-500 flex-wrap">
                  {user.location && (
                    <div className="flex items-center">
                      <span className="material-symbols-outlined mr-1">location_on</span>
                      {user.location}
                    </div>
                  )}
                  {user.website && (
                    <a href={user.website} target="_blank" rel="noopener noreferrer" className="flex items-center text-[#1d9bf0] hover:underline">
                      <span className="material-symbols-outlined mr-1">link</span>
                      {(() => {
                        try {
                          return new URL(user.website).hostname;
                        } catch {
                          return user.website;
                        }
                      })()}
                    </a>
                  )}
                  <div className="flex items-center">
                    <span className="material-symbols-outlined mr-1">calendar_month</span>
                    Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently'}
                  </div>
                </div>
                <div className="flex gap-4 mt-3">
                  <span className="hover:underline cursor-pointer" onClick={() => navigate(`/profile/${user.username}/following`)}>
                    <span className="font-bold">{Array.isArray(following) ? following.length : 0}</span>
                    <span className="text-gray-500 ml-1">Following</span>
                  </span>
                  <span className="hover:underline cursor-pointer" onClick={() => navigate(`/profile/${user.username}/followers`)}>
                    <span className="font-bold">{Array.isArray(followers) ? followers.length : 0}</span>
                    <span className="text-gray-500 ml-1">Followers</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
          {/* Posts */}
          <div className="divide-y divide-gray-800">
            <ProfileMain posts={profilePosts} currentUser={currentUser} onLike={handleLike} onReply={handleReply} />
          </div>
        </main>
        {/* Right Sidebar */}
        <aside className="right-sidebar hidden-desktop lg:block lg:w-[350px] xl:w-[390px] border-l border-gray-700">
          <HomeRightSidebar user={currentUser || user} randomusers={randomusers} />
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
    </div>
  );
};

export default Profile;
