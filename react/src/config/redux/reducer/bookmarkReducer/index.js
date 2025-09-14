import { createSlice } from "@reduxjs/toolkit";
import { getBookmarks } from "../../action/bookmarkAction";

const initialState = {
  bookmarks: [],
  loading: false,
  error: null,
};

const bookmarkSlice = createSlice({
  name: "bookmark",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getBookmarks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBookmarks.fulfilled, (state, action) => {
        state.loading = false;
        state.bookmarks = action.payload;
      })
      .addCase(getBookmarks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load bookmarks";
      });
  },
});

export default bookmarkSlice.reducer;
