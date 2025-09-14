import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { sharePostLink } from '../config/redux/action/postAction'; 

const HomeShareModal = ({ postId, postAuthorUsername, postLink, userList, onClose, onShareSuccess }) => {
  const [search, setSearch] = useState('');
  const [filteredUsers, setFilteredUsers] = useState(userList);
  const [copied, setCopied] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const dispatch = useDispatch();

  React.useEffect(() => {
    setFilteredUsers(
      userList.filter(u =>
        u.username.toLowerCase().includes(search.toLowerCase())
      )
    );
    // Disable page scroll when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [search, userList]);

  const handleCopy = () => {
    navigator.clipboard.writeText(postLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

const handleShare = async () => {
  if (selectedUsers.length === 0) return;
  try {
    await dispatch(
      sharePostLink({
        postId,
        userIds: selectedUsers,
        link: postLink,
      })
    ).unwrap(); // ensures error is caught in catch
    if (onShareSuccess) {
      onShareSuccess();
    } else {
      onClose();
    }
  } catch (err) {
    alert('Failed to share post link.');
    console.log('Error sharing post link:', err);
  }
}

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-md relative" style={{ width: '400px', minHeight: '480px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-white"
          onClick={onClose}
        >
          <span className="material-symbols-outlined">close</span>
        </button>
        <h2 className="text-xl font-bold mb-4">Share Post</h2>
        <div className="mb-4">
          <div className="flex">
            <input
              type="text"
              className="flex-grow p-2 rounded bg-gray-800 text-white border border-gray-700"
              placeholder="Search users..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button
              className="ml-2 px-3 py-2"
              style={{ backgroundColor: '#1d9bf0', color: 'white', borderRadius: '0.375rem', fontWeight: 500, boxShadow: '0 1px 2px rgba(0,0,0,0.08)', transition: 'background 0.2s' }}
              onClick={() => {}}
              type="button"
              onMouseOver={e => e.currentTarget.style.backgroundColor = '#1877c9'}
              onMouseOut={e => e.currentTarget.style.backgroundColor = '#1d9bf0'}
            >
              <span className="material-symbols-outlined align-middle mr-1" style={{ fontSize: '18px' }}>search</span>
              Search
            </button>
          </div>
        </div>
        <div className="mb-4 max-h-40 overflow-y-auto" style={{ height: '180px', overflowY: 'auto', border: '1px solid #222', borderRadius: '0.375rem', background: '#18181b', marginBottom: '1rem' }}>
          {filteredUsers.length > 0 ? (
            filteredUsers.map(user => {
              const checked = selectedUsers.includes(user._id);
              return (
                <div key={user._id} className="flex items-center justify-between py-2 px-2 hover:bg-gray-800 rounded cursor-pointer" onClick={() => {
                  setSelectedUsers(prev =>
                    prev.includes(user._id)
                      ? prev.filter(id => id !== user._id)
                      : [...prev, user._id]
                  );
                }}>
                  <div className="flex items-center space-x-2">
                    <img src={user.profilePhoto?.url || 'https://res.cloudinary.com/dkqd9ects/image/upload/v1747571510/profile_offakc.png'} alt="profile" className="w-8 h-8 rounded-full inline-block" />
                    <span>{user.username}</span>
                  </div>
                  <input
                    type="checkbox"
                    className="accent-[#22c55e] w-4 h-4"
                    id={`share-user-${user._id}`}
                    checked={checked}
                    onChange={e => {
                      setSelectedUsers(prev =>
                        prev.includes(user._id)
                          ? prev.filter(id => id !== user._id)
                          : [...prev, user._id]
                      );
                    }}
                    onClick={e => e.stopPropagation()}
                  />
                </div>
              );
            })
          ) : (
            <div className="text-gray-500 text-sm">No users found</div>
          )}
        </div>
        <div className="mb-4">
          <button
            style={{ width: '100%', backgroundColor: '#1d9bf0', color: 'white', fontWeight: 600, borderRadius: '0.375rem', boxShadow: '0 1px 2px rgba(0,0,0,0.08)', padding: '0.5rem 1rem', transition: 'background 0.2s' }}
            onClick={handleCopy}
            type="button"
            title={postLink}
            onMouseOver={e => e.currentTarget.style.backgroundColor = '#1877c9'}
            onMouseOut={e => e.currentTarget.style.backgroundColor = '#1d9bf0'}
          >
            {copied ? 'Link Copied!' : 'Copy Post Link'}
          </button>
        </div>
        <div className="flex justify-end space-x-2">
          <button
            style={{ backgroundColor: '#22c55e', color: 'white', borderRadius: '0.375rem', fontWeight: 500, padding: '0.5rem 1rem', boxShadow: '0 1px 2px rgba(0,0,0,0.08)', transition: 'background 0.2s', opacity: selectedUsers.length === 0 ? 0.5 : 1, cursor: selectedUsers.length === 0 ? 'not-allowed' : 'pointer' }}
            onClick={handleShare}
            onMouseOver={e => { if (selectedUsers.length !== 0) e.currentTarget.style.backgroundColor = '#16a34a'; }}
            onMouseOut={e => { if (selectedUsers.length !== 0) e.currentTarget.style.backgroundColor = '#22c55e'; }}
            disabled={selectedUsers.length === 0}
          >
            Share
          </button>
          <button
            style={{ backgroundColor: '#6b7280', color: 'white', borderRadius: '0.375rem', fontWeight: 500, padding: '0.5rem 1rem', boxShadow: '0 1px 2px rgba(0,0,0,0.08)', transition: 'background 0.2s' }}
            onClick={onClose}
            onMouseOver={e => e.currentTarget.style.backgroundColor = '#4b5563'}
            onMouseOut={e => e.currentTarget.style.backgroundColor = '#6b7280'}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomeShareModal;
