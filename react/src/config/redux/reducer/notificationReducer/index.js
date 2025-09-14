import { createSlice } from '@reduxjs/toolkit';
import { getUnreadCount, markNotificationsAsRead } from '../../action/NotificationAction';

const notificationSlice = createSlice({
  name: 'notification',
  initialState: {
    count: 0,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getUnreadCount.fulfilled, (state, action) => {
        state.count = action.payload;
      })
      .addCase(getUnreadCount.rejected, (state) => {
        state.error = 'Failed to get count';
      })
      .addCase(markNotificationsAsRead.fulfilled, (state) => {
        state.count = 0; // ✅ clear unread count
      });
  },
});

export default notificationSlice.reducer;
