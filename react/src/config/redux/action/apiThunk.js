import { createAsyncThunk } from "@reduxjs/toolkit";
import {clientServer} from "../../clientServer.jsx";

export const markMessagesRead = createAsyncThunk(
  "messages/markRead",
  async (fromUserId, thunkAPI) => {
    try {
      const res = await clientServer.post('/api/messages/mark-read', { fromUserId }, { withCredentials: true });
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchMessageCounts = createAsyncThunk(
  "messages/fetchCounts",
  async (_, thunkAPI) => {
    try {
      const res = await clientServer.get('/api/messages/counts', { withCredentials: true });
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchPosts = createAsyncThunk(
  "posts/fetchPosts",
  async (_, thunkAPI) => {
    try {
      const res = await clientServer.get('/', { withCredentials: true });
         return res.data
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const toggleLike = createAsyncThunk(
  "post/:postId/like",
  async (postId, thunkAPI) => {
    try {
      const res = await clientServer.post(`/post/${postId}/like`, {}, { withCredentials: true });
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const toggleBookmark = createAsyncThunk(
  "posts/toggleBookmark",
  async (postId, thunkAPI) => {
    try {
      const res = await clientServer.post(`/post/${postId}/bookmark`, {}, { withCredentials: true });
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const submitReply = createAsyncThunk(
  "posts/submitReply",
  async ({ postId, content }, thunkAPI) => {
    try {
      const res = await clientServer.post(`/post/${postId}/reply`, { content }, { withCredentials: true });
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchComments = createAsyncThunk(
  "posts/fetchComments",
  async (postId, thunkAPI) => {
    try {
      const res = await clientServer.get(`/post/${postId}/comments`, { withCredentials: true });
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const toggleCommentLike = createAsyncThunk(
  "posts/toggleCommentLike",
  async ({ postId, commentId }, thunkAPI) => {
    try {
      const res = await clientServer.post(`/post/${postId}/comments/${commentId}/like`, {}, { withCredentials: true });
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const deleteComment = createAsyncThunk(
  "posts/deleteComment",
  async ({ postId, commentId }, thunkAPI) => {
    try {
      const res = await clientServer.delete(`/post/${postId}/comments/${commentId}/delete`, { withCredentials: true });
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const editComment = createAsyncThunk(
  "posts/editComment",
  async ({ postId, commentId, content }, thunkAPI) => {
    try {
      const res = await clientServer.put(`/post/${postId}/comments/${commentId}/edit`, { content }, { withCredentials: true });
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);
