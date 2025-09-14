import { createAsyncThunk } from "@reduxjs/toolkit";
import { clientServer } from "../../../../config/clientServer";
// Thunk to fetch profile, followers, and following
export const fetchProfileDataThunk = createAsyncThunk(
  "profile/fetchProfileData",
  async ({ username }, thunkAPI) => {
    try {
      const [profileRes, followersRes, followingRes] = await Promise.all([
        clientServer.get(`api/profile/${username}`, {
          withCredentials: true,
        }),
        clientServer.get(`api/profile/${username}/followers`, {
          withCredentials: true,
        }),
        clientServer.get(`api/profile/${username}/following`, {
          withCredentials: true,
        }),
      ]);

      let profileData = {}, followersData = {}, followingData = {};
      if (profileRes.status === 200) {
        profileData = profileRes.data;
      }
      if (followersRes.status === 200) {
        followersData = followersRes.data;
      }
      if (followingRes.status === 200) {
        followingData = followingRes.data;
      }

      return {
        user: profileData.user || null,
        posts: profileData.posts || [],
        followers: followersData.followers || [],
        following: followingData.following || [],
      };
    } catch (err) {
      return thunkAPI.rejectWithValue({
        message: "Failed to fetch profile data."
      });
    }
  }
);

export const editProfileThunk = createAsyncThunk(
  "profile/edit",
  async (user, thunkAPI) => {
    try {
      // Prepare FormData for file uploads
      const formData = new FormData();
      formData.append("username", user.username);
      formData.append("email", user.email);
      if (user.profilePhoto && user.profilePhoto instanceof File) {
        formData.append("Image", user.profilePhoto);
      }
      if (user.coverPhoto && user.coverPhoto instanceof File) {
        formData.append("cover", user.coverPhoto);
      }
      const response = await clientServer.post("profile/edit", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      if (response && response.data && response.data.success) {
        return thunkAPI.fulfillWithValue(response.data.user);
      } else {
        const msg = typeof response?.data === 'string' ? response.data : (response?.data?.error || "Profile update failed, please try again.");
        return thunkAPI.rejectWithValue(msg);
      }
    } catch (err) {
      if (err.response && err.response.status === 401) {
        return thunkAPI.rejectWithValue({
          message: "Unauthorized. Please log in again."
        });
      }
      return thunkAPI.rejectWithValue(err.response?.data || {
        message: "Profile update failed, please try again."
      });
    }
  }
);