// src/config/redux/action/NotificationAction.js
import { createAsyncThunk } from '@reduxjs/toolkit';
import { clientServer } from '../../../../config/clientServer';

export const getUnreadCount = createAsyncThunk(
  'notification/getUnreadCount',
  async (_, thunkAPI) => {
    try {
      const res = await clientServer.get('/api/notifications', {
        withCredentials: true,
      });

      const unread = res.data?.filter((n) => !n.read).length || 0;
      console.log('📨 [Action] Unread count from server:', unread);
      return unread;
    } catch (error) {
      console.error('❌ Failed to fetch unread count:', error);
      return thunkAPI.rejectWithValue(
        error?.response?.data?.message || 'Fetch failed'
      );
    }
  }
);

export const markNotificationsAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (_, thunkAPI) => {
    try {
      await clientServer.post('/api/notifications/mark-all-read', {}, { withCredentials: true });
      console.log("✅ [Action] Marked all notifications as read");
      return true;
    } catch (err) {
      console.error("❌ Failed to mark notifications as read", err);
      return thunkAPI.rejectWithValue('Failed to mark notifications as read');
    }
  }
);




