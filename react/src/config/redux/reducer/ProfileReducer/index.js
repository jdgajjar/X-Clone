import { createSlice } from "@reduxjs/toolkit";
import { editProfileThunk, fetchProfileDataThunk } from "../../action/profileAction/index";

const initialState = {
  profile: null,
  posts: [],
  followers: [],
  following: [],
  loading: false,
  error: null,
};

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    resetProfile: (state) => {
      state.profile = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(editProfileThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editProfileThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(editProfileThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to edit profile";
      })
      // fetchProfileDataThunk
      .addCase(fetchProfileDataThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfileDataThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload.user;
        state.posts = action.payload.posts;
        state.followers = action.payload.followers;
        state.following = action.payload.following;
      })
      .addCase(fetchProfileDataThunk.rejected, (state, action) => {
        state.loading = false;
        state.profile = null;
        state.posts = [];
        state.followers = [];
        state.following = [];
        state.error = action.payload?.message || "Failed to fetch profile data";
      });
  },
});

export const { resetProfile } = profileSlice.actions;
export default profileSlice.reducer;

