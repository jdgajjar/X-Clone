import React, { useState } from "react";

const Settings = ({ user, onDeleteAccount, onLogout }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  return (
    <div className="bg-black min-h-screen">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <a href="/" className="text-gray-400 hover:text-white transition-colors">
            <span className="material-symbols-outlined">close</span>
          </a>
        </div>
        {/* Account Settings */}
        <div className="bg-[#16181C] rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">Account Settings</h2>
          {/* Profile Information */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">Profile Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1">Username</label>
                <input type="text" value={user?.username || ''} className="w-full bg-[#202327] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500" readOnly />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Email</label>
                <input type="email" value={user?.email || ''} className="w-full bg-[#202327] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500" readOnly />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Account Created</label>
                <input type="text" value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently'} className="w-full bg-[#202327] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500" readOnly />
              </div>
            </div>
          </div>
          {/* Account Actions */}
          <div className="space-y-4">
            <button onClick={() => setShowDeleteModal(true)} className="w-full text-red-500 hover:text-red-400 font-semibold py-2 px-4 rounded-lg hover:bg-red-500/10 transition-colors">
              Delete Account
            </button>
            <button onClick={onLogout} className="block w-full text-white hover:text-gray-200 font-semibold py-2 px-4 rounded-lg hover:bg-white/10 transition-colors text-center">
              Log Out
            </button>
          </div>
        </div>
        {/* Delete Account Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#16181C] rounded-2xl p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold text-white mb-4">Delete Account</h3>
              <p className="text-gray-400 mb-6">
                Are you sure you want to delete your account? This action cannot be undone. All your posts and data will be permanently deleted.
              </p>
              <div className="flex justify-end space-x-4">
                <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 text-white hover:text-gray-200 transition-colors">
                  Cancel
                </button>
                <button onClick={onDeleteAccount} className="px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors">
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
