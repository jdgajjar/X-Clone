import { createAsyncThunk } from "@reduxjs/toolkit";
import { clientServer } from "../../../../config/clientServer";

// Fetch bookmarks for the current user
export const getBookmarks = createAsyncThunk(
  "bookmarks/get",
  async (_, thunkAPI) => {
    try {
      const response = await clientServer.get("/api/bookmarks", { withCredentials: true });
      return thunkAPI.fulfillWithValue(response.data.posts || []);
    } catch (error) {
      console.log('[getBookmarks] Error:', error);
      return thunkAPI.rejectWithValue(error.response?.data?.error || "Failed to load bookmarks");
    }
  }
);
