import { clientServer } from '../config/clientServer';

// ✅ Message read/unread API helpers
export async function markMessagesRead(fromUserId) {
  try {
    const res = await clientServer.post(
      '/api/messages/mark-read',
      { fromUserId },
      { withCredentials: true }
    );
    return res.data;
  } catch (err) {
    console.error("Failed to mark messages as read:", err.response?.data || err.message);
    throw new Error('Failed to mark messages as read');
  }
}

export async function fetchMessageCounts() {
  try {
    const res = await clientServer.get('/api/messages/counts', { withCredentials: true });
    return res.data;
  } catch (err) {
    console.error("Failed to fetch message counts:", err.response?.data || err.message);
    throw new Error('Failed to fetch message counts');
  }
}

// ✅ Fetch all posts
export async function fetchPosts() {
  try {
    const res = await clientServer.get('/', { withCredentials: true });
    return res.data.posts;
  } catch (err) {
    console.error("Failed to fetch posts:", err.response?.data || err.message);
    throw new Error('Failed to fetch posts');
  }
}

// ✅ Like/unlike a post
export async function toggleLike(postId) {
  try {
    const res = await clientServer.post(
      `/post/${postId}/like`,
      {},
      { withCredentials: true }
    );
    return res.data;
  } catch (err) {
    console.error("toggleLike error:", err.response?.data || err.message);
    throw new Error('Failed to like post');
  }
}

// ✅ Bookmark/unbookmark a post
export async function toggleBookmark(postId) {
  try {
    const res = await clientServer.post(
      `/post/${postId}/bookmark`,
      {},
      { withCredentials: true }
    );
    return res.data; // { success: true, isBookmarked: true/false }
  } catch (err) {
    console.error("Failed to bookmark post:", err.response?.data || err.message);
    throw new Error("Failed to bookmark post");
  }
}

// ✅ Submit a reply to a post
export async function submitReply(postId, content) {
  try {
    const res = await clientServer.post(
      `/post/${postId}/reply`,
      { content },
      { withCredentials: true }
    );
    return res.data;
  } catch (err) {
    console.error("Failed to submit reply:", err.response?.data || err.message);
    throw new Error('Failed to submit reply');
  }
}

// ✅ Fetch comments on a post
export async function fetchComments(postId) {
  try {
    const res = await clientServer.get(
      `/post/${postId}/comments`,
      { withCredentials: true }
    );
    return res.data;
  } catch (err) {
    console.error("Failed to fetch comments:", err.response?.data || err.message);
    throw new Error('Failed to fetch comments');
  }
}

// ✅ Like/unlike a comment
export async function toggleCommentLike(postId, commentId) {
  try {
    const res = await clientServer.post(
      `/post/${postId}/comments/${commentId}/like`,
      {},
      { withCredentials: true }
    );
    return res.data;
  } catch (err) {
    console.error("Failed to like comment:", err.response?.data || err.message);
    throw new Error('Failed to like comment');
  }
}

// ✅ Delete a comment
export async function deleteComment(postId, commentId) {
  try {
    const res = await clientServer.delete(
      `/post/${postId}/comments/${commentId}/delete`,
      { withCredentials: true }
    );
    return res.data;
  } catch (err) {
    console.error("Failed to delete comment:", err.response?.data || err.message);
    throw new Error('Failed to delete comment');
  }
}

// ✅ Edit a comment
export async function editComment(postId, commentId, content) {
  try {
    const res = await clientServer.put(
      `/post/${postId}/comments/${commentId}/edit`,
      { content },
      { withCredentials: true }
    );
    return res.data;
  } catch (err) {
    console.error("Failed to edit comment:", err.response?.data || err.message);
    throw new Error('Failed to edit comment');
  }
}
