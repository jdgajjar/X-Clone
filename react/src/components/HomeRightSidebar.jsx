// File: src/components/RightSidebar.jsx

import React from "react";
import { useNavigate } from "react-router-dom";

const HomeRightSidebar = ({ user, randomusers = [] }) => {
  const navigate = useNavigate();

  const handleViewProfile = (username) => {
    if (username) navigate(`/profile/${username}`);
  };


  const showUsers = (randomusers || []).filter(
    (u) => u.username && u.username !== (user?.username || "")
  );

  // Only show real users, no demo fallback

  console.log("Filtered Users:", showUsers);

  return (
    <aside className="right-sidebar lg:block fixed  z-6 mt-10 w-[350px] border-l border-gray-700 px-6 py-3 min-h-screen bg-transparent xl:w-[390px]">
      {!user?.IsVerified && (
        <div className="bg-[#16181C] rounded-2xl p-4 mt-4">
          <h2 className="font-bold text-xl mb-2">Subscribe to Premium</h2>
          <p className="mb-3">
            Subscribe to unlock new features and if eligible, receive a share of
            ads revenue.
          </p>
          <button
            onClick={() => navigate("/premium")}
            className="bg-[#1d9bf0] hover:bg-[#1A8CD8] text-white font-bold rounded-full px-4 py-2 transition-colors"
          >
            Subscribe
          </button>
        </div>
      )}

      <div className="bg-[#16181C] rounded-2xl mt-4">
        <h2 className="font-bold text-xl p-4">Who to follow</h2>
        {showUsers.length > 0 ? (
          showUsers.map((randomuser, index) => (
            <div
              key={randomuser._id || randomuser.username || index}
              className="flex items-center justify-between px-4 py-3 hover:bg-gray-900"
            >
              <div className="flex items-center">
                <img
                  src={
                    randomuser.profilePhoto?.url ||
                    "https://res.cloudinary.com/dkqd9ects/image/upload/v1747571510/profile_offakc.png"
                  }
                  alt="X Clone"
                  className="w-10 h-10 rounded-full"
                />
                <div className="ml-3">
                  <div className="text-sm font-medium ">
                    {randomuser.name || randomuser.username}
                  </div>
                 
                </div>
                {randomuser.IsVerified && (
                  <span title="Verified" className="ml-1">
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
              </div>
              <button
                onClick={() => handleViewProfile(randomuser.username)}
                className="follow-btn px-4 py-1 text-sm font-medium text-white bg-blue-500 rounded-full hover:bg-blue-600"
              >
                view
              </button>
            </div>
          ))
        ) : (
          <div className="px-4 py-6 text-gray-400 text-center">
            No users to follow right now.
          </div>
        )}
      </div>

      <footer className="px-4 py-4 text-gray-500 text-sm">
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <a href="#" className="hover:underline">
            Terms of Service
          </a>
          <a href="#" className="hover:underline">
            Privacy Policy
          </a>
          <a href="#" className="hover:underline">
            Cookie Policy
          </a>
          <a href="#" className="hover:underline">
            Accessibility
          </a>
          <a href="#" className="hover:underline">
            Ads info
          </a>
          <a href="#" className="hover:underline">
            More
          </a>
        </div>
        <div className="mt-2">© 2026 X Corp.</div>
      </footer>
    </aside>
  );
};

export default HomeRightSidebar;
