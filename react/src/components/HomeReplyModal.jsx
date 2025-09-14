// File: src/components/ReplyModal.jsx

import React, { useEffect, useState } from 'react';
import { fetchComments, submitReply, toggleCommentLike, deleteComment, editComment } from '../utils/api';

const getCurrentUserName = () => {
  if (typeof window !== 'undefined') {
    return document.body.getAttribute('data-current-user-name') || '';
  }
  return '';
};

const HomeReplyModal = ({ postId, postAuthorUsername, isVerified, onClose }) => {
  const [content, setContent] = useState('');
  const [comments, setComments] = useState([]);
  const currentUserName = getCurrentUserName();

  useEffect(() => {
    if (postId) {
      fetchComments(postId).then(setComments);
    }
  }, [postId]);

  const handleSubmit = async () => {
    if (!content.trim()) {
      alert('Reply cannot be empty.');
      return;
    }
    const success = await submitReply(postId, content);
    if (success) {
      setContent('');
      fetchComments(postId).then(setComments);
    } else {
      alert('Failed to submit reply.');
    }
  };

  // Add this function to handle comment like
  const handleCommentLike = async (commentId) => {
    try {
      const data = await toggleCommentLike(postId, commentId);
      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment._id === commentId
            ? { ...comment, likes: Array(data.likesCount).fill(0) }
            : comment
        )
      );
    } catch (err) {
      console.error('Failed to like comment', err);
    }
  };

  // Handle comment delete
  const handleCommentDelete = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    try {
      await deleteComment(postId, commentId);
      // Refresh comments after delete
      fetchComments(postId).then(setComments);
    } catch (err) {
      alert('Failed to delete comment.');
    }
  };

  // Handle comment edit
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingContent, setEditingContent] = useState('');

  const handleEditClick = (comment) => {
    setEditingCommentId(comment._id);
    setEditingContent(comment.content);
  };

  const handleEditSave = async (commentId) => {
    if (!editingContent.trim()) {
      alert('Comment cannot be empty.');
      return;
    }
    try {
      await editComment(postId, commentId, editingContent);
      setEditingCommentId(null);
      setEditingContent('');
      fetchComments(postId).then(setComments);
    } catch (err) {
      alert('Failed to update comment.');
    }
  };

  const handleEditCancel = () => {
    setEditingCommentId(null);
    setEditingContent('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-black rounded-lg p-4 w-96">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your reply..."
          className="w-full border border-gray-300 rounded-lg p-2 text-black"
        />
        <div className="flex justify-between items-center mt-2">
          <button className="text-gray-400" onClick={onClose}>Cancel</button>
          <button className="bg-blue-500 text-white px-4 py-2 rounded-lg" onClick={handleSubmit}>Reply</button>
        </div>
        <div className="bg-black text-white p-4 rounded-lg h-64 overflow-y-auto mt-4">
          {comments.length > 0 ? comments.map((comment, index) => (
            <div key={index} className="p-2 border-b border-gray-700">
              <div className="flex items-start space-x-3">
                <img
                  src={comment.author?.profilePhoto?.url || 'https://res.cloudinary.com/dkqd9ects/image/upload/v1747571510/profile_offakc.png'}
                  alt="User Profile"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center font-bold relative justify-between">
                    <div className="flex items-center gap-1">
                      <span>{comment.author?.username || 'Unknown'}</span>
                      {comment.author?.IsVerified && (
                        <span title="Verified" className="flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 50 50"
                            className="inline-block align-middle"
                          >
                            <path
                              fill="#1DA1F2"
                              d="M45.103,24.995l3.195-6.245l-5.892-3.807l-0.354-7.006l-7.006-0.35l-3.81-5.89l-6.242,3.2l-6.245-3.196l-3.806,5.893 L7.938,7.948l-0.352,7.007l-5.89,3.81l3.2,6.242L1.702,31.25l5.892,3.807l0.354,7.006l7.006,0.35l3.81,5.891l6.242-3.2l6.245,3.195 l3.806-5.893l7.005-0.354l0.352-7.006l5.89-3.81L45.103,24.995z M22.24,32.562l-6.82-6.819l2.121-2.121l4.732,4.731l10.202-9.888 l2.088,2.154L22.24,32.562z"
                            />
                          </svg>
                        </span>
                      )}
                    </div>
                    {/* 3-dot menu for comment author, right side, ejs style */}
                    {(comment.author?.username === currentUserName || postAuthorUsername === currentUserName) && (
                      <div className="relative ml-1">
                        <button
                          className="material-symbols-outlined text-[16px] cursor-pointer absolute right-0 top-0"
                          title="More options"
                          onClick={() => {
                            const dropdown = document.getElementById(`comment-dropdown-${comment._id}`);
                            if (dropdown) dropdown.classList.toggle('hidden');
                          }}
                        >
                          more_horiz
                        </button>
                        <div
                          id={`comment-dropdown-${comment._id}`}
                          className="absolute right-0 top-6 bg-[#222] border border-gray-700 rounded shadow-lg w-28 z-20 hidden"
                        >
                          {comment.author?.username === currentUserName && (
                            editingCommentId === comment._id ? null : (
                              <button
                                className="block w-full text-left px-4 py-2 hover:bg-gray-800 text-white"
                                onClick={() => {
                                  handleEditClick(comment);
                                  // Hide dropdown after clicking edit
                                  const dropdown = document.getElementById(`comment-dropdown-${comment._id}`);
                                  if (dropdown) dropdown.classList.add('hidden');
                                }}
                              >
                                Edit
                              </button>
                            )
                          )}
                          {(comment.author?.username === currentUserName || postAuthorUsername === currentUserName) && (
                            <button className="block w-full text-left px-4 py-2 hover:bg-gray-800 text-red-500" onClick={() => handleCommentDelete(comment._id)}>Delete</button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  {/* EJS-style: username and badge as a link, content in a separate div for edit */}
                  <div id={`comment-content-${comment._id}`}>
                    {editingCommentId === comment._id ? (
                      <>
                        <textarea
                          id={`edit-comment-textarea-${comment._id}`}
                          className="w-full border border-gray-700 rounded-lg p-2 text-black"
                          style={{ color: 'black' }}
                          value={editingContent}
                          onChange={e => setEditingContent(e.target.value)}
                        />
                        <div className="flex gap-2 mt-2">
                          <button className="bg-blue-500 text-white px-3 py-1 rounded" onClick={() => handleEditSave(comment._id)}>Save</button>
                          <button className="bg-gray-600 text-white px-3 py-1 rounded" onClick={handleEditCancel}>Cancel</button>
                        </div>
                      </>
                    ) : (
                      <p>{comment.content}</p>
                    )}
                  </div>
                  <button className="flex items-center space-x-1 text-gray-500 hover:text-red-500 mt-2" onClick={() => handleCommentLike(comment._id)}>
                    <span className="material-symbols-outlined">favorite</span>
                    <span>{comment.likes?.length || 0}</span>
                  </button>
                </div>
              </div>
            </div>
          )) : <p className="text-gray-500">No comments yet.</p>}
        </div>
      </div>
    </div>
  );
};

export default HomeReplyModal;
