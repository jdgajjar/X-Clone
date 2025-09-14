import React from "react";
import { useNavigate } from 'react-router-dom';
import HomeSidebar from './HomeSidebar';
import HomeRightSidebar from './HomeRightSidebar';
import HomeHead from './HomeHead';
import ProfileHeaderInfo from './ProfileHeaderInfo';

const Followers = ({ user, followers = [], following = [], currentUser, onFollowToggle, randomusers = [], followingState = {} }) => {
  const navigate = useNavigate();
  // Only filter out the current user from their own followers list
  const filteredFollowers = (currentUser && user && currentUser._id === user._id)
    ? followers.filter(f => f._id !== currentUser._id)
    : followers;
  return (
    <div className="antialiased bg-black text-white font-sans min-h-screen">
      {/* Header/Navbar */}
      <div className="fixed top-0 left-0 w-full bg-black z-50">
        <HomeHead />
      </div>
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
        <main className="flex-grow border-x border-gray-800 min-h-screen md:max-w-[600px] mx-auto">
          <ProfileHeaderInfo user={user} currentUser={currentUser} followers={followers} following={following} label="Followers" />
          {/* Followers List */}
          <div className="divide-y divide-gray-800">
            {filteredFollowers.length > 0 ? (
              filteredFollowers.map((follower, idx) => (
                <div key={follower._id || idx} className="flex items-center justify-between p-4 hover:bg-gray-900/50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center overflow-hidden">
                      {follower.profilePhoto && follower.profilePhoto.url ? (
                        <img src={follower.profilePhoto.url} alt={follower.username} className="w-full h-full object-cover rounded-full" onError={e => {e.target.onerror=null; e.target.src='https://res.cloudinary.com/dkqd9ects/image/upload/v1747571510/profile_offakc.png';}} />
                      ) : (
                        <span className="text-white text-xl font-bold">{follower.username[0].toUpperCase()}</span>
                      )}
                    </div>
                    <div>
                      <button onClick={() => navigate(`/profile/${follower.username}`)}>
                        <h3 className="font-bold">{follower.username}</h3>
                        <p className="text-gray-500">@{follower.email ? follower.email.split('@')[0] : 'unknown'}</p>
                      </button>
                    </div>
                  </div>
                  {/* Only show follow button if not current user */}
                  {currentUser && follower._id !== currentUser._id && (
                    <button
                      className={`px-4 py-1.5 rounded-full font-bold transition-colors follow-button ${followingState[follower._id] ? 'bg-white text-black hover:bg-gray-200' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
                      onClick={() => onFollowToggle(follower.username)}
                    >
                      {followingState[follower._id] ? 'Following' : 'Follow'}
                    </button>
                  )}
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                <p>No followers found</p>
              </div>
            )}
          </div>
        </main>
        {/* Right Sidebar */}
        <aside className="right-sidebar hidden-desktop lg:block lg:w-[350px] xl:w-[390px] border-l border-gray-700">
          <HomeRightSidebar user={currentUser || user} randomusers={randomusers} />
        </aside>
      </div>
    </div>
  );
};

export default Followers;
