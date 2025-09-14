import { createSlice } from "@reduxjs/toolkit";
import { deletePostThunk, editPostThunk, sharePostLink } from "../../action/postAction";

const initialState = {
  posts: [],
  loading: false,
  error: null,
   success: false,
};

const postSlice = createSlice({
  name: "post",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(deletePostThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePostThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = state.posts.filter(post => post._id !== action.payload.postId);
      })
      .addCase(deletePostThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to delete post";
      })
      .addCase(editPostThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editPostThunk.fulfilled, (state, action) => {
        state.loading = false;
        // Update the post in the posts array
        state.posts = state.posts.map(post =>
          post._id === action.payload._id ? action.payload : post
        );
      })
      .addCase(editPostThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to edit post";
      })
      .addCase(sharePostLink.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(sharePostLink.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(sharePostLink.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default postSlice.reducer;
