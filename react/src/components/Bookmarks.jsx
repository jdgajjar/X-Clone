import React, { useState } from "react";
import HomeReplyModal from "./HomeReplyModal";
import { toggleLike } from "../utils/api";
import { useSelector, useDispatch } from "react-redux";
import { getBookmarks } from "../config/redux/action/bookmarkAction/index.js";


const Bookmarks = ({ posts = [], PostPartial, user }) => {
  const [replyModal, setReplyModal] = useState({ visible: false, postId: null, username: '', isVerified: false });
  const [bookmarkedPosts, setBookmarkedPosts] = useState(posts);

  const bookmarks = useSelector((state) => state.bookmark);
  const dispatch = useDispatch();


  const fetchBookmarks = async () => {
    try {
      const data = await dispatch(getBookmarks()).unwrap();
      setBookmarkedPosts(data);
    } catch (err) {
      console.error('Failed to fetch bookmarks:', err);
      setBookmarkedPosts([]);
    }
  };



 // Handle like action after using clintserver in apiThunk.js in real application
const handleLike = async (postId) => {
  try {
    const data = await toggleLike(postId);
    // Ensure backend sends something like: { likesCount: 5, liked: true }

    setBookmarkedPosts((prevPosts) =>
      prevPosts.map((post) =>
        post._id === postId
          ? {
              ...post,
              likes: Array.from({ length: data.likesCount }, () => ({})),
              liked: data.liked, // optional, if your post tracks if the user liked it
            }
          : post
      )
    );
  } catch (err) {
    console.error('Failed to like post:', err?.response?.data || err.message);
  }
};

  // Listen for bookmark changes globally (optional: if you want to update on every visit)
  React.useEffect(() => {
    fetchBookmarks();
    // eslint-disable-next-line
  }, []);

  const handleToggleReplyModal = (postId, username, isVerified) => {
    setReplyModal({ visible: true, postId, username, isVerified });
  };

  return (
    <div className="bg-black text-white min-h-screen">
      <div className="max-w-2xl mx-auto py-8 px-4">
        <a href="#" onClick={() => window.history.back()} className="flex items-center mb-4">
          <span className="material-symbols-outlined mr-2">arrow_back</span> Back
        </a>
        <h1 className="text-2xl font-bold mb-6">Bookmarked Posts</h1>
        <main>
          <div id="bookmarks-list">
            {bookmarkedPosts.length > 0 ? (
              bookmarkedPosts.map((post, idx) => (
                PostPartial ? (
                  <PostPartial
                    key={post._id || idx}
                    post={post}
                    currentUser={user}
                    onLike={() => handleLike(post._id)}
                    onReply={() => handleToggleReplyModal(post._id, post.author?.username, post.author?.IsVerified)}
                  />
                ) : null
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                <p>No bookmarks found.</p>
              </div>
            )}
          </div>
        </main>
        {replyModal.visible && (
          <HomeReplyModal
            postId={replyModal.postId}
            postAuthorUsername={replyModal.username}
            isVerified={replyModal.isVerified}
            onClose={() => setReplyModal({ visible: false })}
          />
        )}
      </div>
    </div>
  );
};

export default Bookmarks;
