
import React, { useState, useEffect } from "react";
import PostPartial from "./PostPartial";
import HomeReplyModal from "./HomeReplyModal";
import HomeShareModal from "./HomeShareModal";
import { toggleLike } from "../utils/api";
import { clientServer } from "../config/clientServer";
import { useNavigate } from "react-router-dom";
import "./popAnimation.css";

const Post = ({ post: initialPost, currentUser }) => {
  // If initialPost is an Axios response, extract the post object
  const getPostObject = (input) => {
    if (input && input.data && input.data.post) return input.data.post;
    return input;
  };
  const [post, setPost] = useState(getPostObject(initialPost));
  const [replyModal, setReplyModal] = useState({ visible: false, postId: null, username: '', isVerified: false });
  const [shareModal, setShareModal] = useState({ visible: false, postId: null, username: '', postLink: '', userList: [] });
  const [shareSuccess, setShareSuccess] = useState(false);
  const navigate = useNavigate();




  const handleLike = async () => {
    try {
      const data = await toggleLike(post._id);
      setPost(prev => ({
        ...prev,
        likes: Array(data.likesCount).fill({}),
        isLiked: data.isLiked,
      }));
    } catch (err) {
      // Optionally show error
    }
  };

  const handleReply = () => {
    setReplyModal({
      visible: true,
      postId: post._id,
      username: post.author?.username,
      isVerified: post.author?.IsVerified,
    });
  };


  // Open reply modal if URL contains #comment-<id>
  useEffect(() => {
    if (window.location.hash.startsWith('#comment-')) {
      setReplyModal({
        visible: true,
        postId: post._id,
        username: post.author?.username,
        isVerified: post.author?.IsVerified,
      });
    }
  }, [post]);


  const handleShare = async () => {
    const postLink = `${window.location.origin}/post/${post._id}`;
    try {
      const res = await clientServer.get('/api/users');
      const userList = Array.isArray(res.data.users) ? res.data.users : [];
      setShareModal({
        visible: true,
        postId: post._id,
        username: post.author?.username,
        postLink,
        userList,
      });
    } catch (e) {
      setShareModal({
        visible: true,
        postId: post._id,
        username: post.author?.username,
        postLink,
        userList: [],
      });
    }
  };

  // Handler for when share is successful
  const handleShareSuccess = () => {
    setShareSuccess(true);
    setShareModal((prev) => ({ ...prev, visible: false }));
    setTimeout(() => setShareSuccess(false), 2000);
  };

   const handleViewProfile = (username) => {
    if (username) navigate(`/profile/${username}`);
  };

  return (
    <div className="bg-black text-white min-h-screen">
      <div className="max-w-2xl mx-auto py-8 px-4">
        <a href="/" className="text-blue-400 hover:underline mb-4 inline-block">&larr; Back to Home</a>
        <PostPartial
          post={post}
          currentUser={currentUser}
          onLike={handleLike}
          onReply={handleReply}
          onShare={handleShare}
          handleViewProfile={handleViewProfile}
        />
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
          visible={shareModal.visible}
          postId={shareModal.postId}
          username={shareModal.username}
          postLink={shareModal.postLink}
          userList={shareModal.userList}
          onClose={() => setShareModal({ ...shareModal, visible: false })}
          onShareSuccess={handleShareSuccess}
        />
      )}
      <div className={`share-success-popup${shareSuccess ? ' show' : ''}`}>Post sent successfully!</div>
    </div>
  );
};




export default Post;