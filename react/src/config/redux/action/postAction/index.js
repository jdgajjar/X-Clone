import { createAsyncThunk } from "@reduxjs/toolkit";
import { clientServer } from "../../../../config/clientServer";
// Async thunk for fetching a single post
export const fetchPostThunk = createAsyncThunk(
  "post/fetch",
  async (id, thunkAPI) => {
    try {
      const res = await clientServer.get(`/api/post/${id}`);
      return res.data.post || res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.error || "Post not found");
    }
  }
);
// Async thunk for editing a post
export const editPostThunk = createAsyncThunk(
  "post/edit",
  async ({ id, formData }, thunkAPI) => {
    try {
      const res = await clientServer.put(`/api/post/${id}/edit`, formData, {
        withCredentials: true,
        headers: { 
          'Accept': 'application/json',
          // Remove Content-Type to let axios set it automatically for FormData
          'Content-Type': undefined
        },
      });
      console.log('[editPostThunk] Response:', res.data);
      // Return the updated post object
      return res.data.post || res.data;
    } catch (err) {
      console.log('[editPostThunk] Error:', err);
      return thunkAPI.rejectWithValue(err.response?.data?.error || "Failed to edit post");
    }
  }
);

// Async thunk for deleting a post
export const deletePostThunk = createAsyncThunk(
  "post/delete",
  async (postId, thunkAPI) => {
    try {
      const url = `/api/post/${postId}/delete`;
      const res = await clientServer.delete(url, {
        withCredentials: true,
        headers: { 'Accept': 'application/json' },
      });
      if (res.status === 200) {
        return { postId };
      } else {
        return thunkAPI.rejectWithValue("Failed to delete post");
      }
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.error || "Failed to delete post");
    }
  }
);

// Async thunk for sharing a post link
export const sharePostLink = createAsyncThunk(
  "post/share",
  async ({ postId, userIds, link }, { rejectWithValue }) => {
    try {
      const res = await clientServer.post(
        "/api/message/share",
        { postId, userIds, link },
        { withCredentials: true }
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to share post");
    }
  }
);