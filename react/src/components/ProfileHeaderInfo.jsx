import React from "react";
import { useNavigate } from 'react-router-dom';

const getCount = (userArr, propArr) => {
  if (Array.isArray(userArr)) return userArr.length;
  if (Array.isArray(propArr)) return propArr.length;
  return '-'; // Show dash if missing, not 0
};

const ProfileHeaderInfo = ({ user, following = [], followers = [], label = "Followers" }) => {
  const navigate = useNavigate();
  console.log("ProfileHeaderInfo user:", user);
  console.log("ProfileHeaderInfo following:", following);
  console.log("ProfileHeaderInfo followers:", followers);

  return (
    <>
      {/* Page Header */}
      <div className="sticky top-0 z-30 bg-black/90 backdrop-blur-md">
        <div className="flex items-center px-4 h-14">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-800 transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="ml-6">
            <h1 className="font-bold text-xl">{user.username}</h1>
            <p className="text-gray-500 text-sm">{label}</p>
          </div>
        </div>
      </div>
      {/* User Info */}
      <div className="border-b border-gray-800 px-4 pb-3">
        <div className="flex gap-4 mt-3">
          <span className="hover:underline cursor-pointer" onClick={() => navigate(`/profile/${user.username}/following`)}>
            <span className="font-bold">{getCount(user?.following, following)}</span>
            <span className="text-gray-500 ml-1">Following</span>
          </span>
          <span className="hover:underline cursor-pointer" onClick={() => navigate(`/profile/${user.username}/followers`)}>
            <span className="font-bold">{getCount(user?.followers, followers)}</span>
            <span className="text-gray-500 ml-1">Followers</span>
          </span>
        </div>
      </div>
    </>
  );
};

export default ProfileHeaderInfo;
