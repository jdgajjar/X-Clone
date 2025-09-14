import { configureStore } from '@reduxjs/toolkit';
import authReducer from './reducer/authReducer';
import notificationReducer from './reducer/notificationReducer';
import profileReducer from './reducer/ProfileReducer';

const store = configureStore({
  reducer: {
    auth: authReducer,
    notification: notificationReducer,
    profile: profileReducer,
  },
});

export default store;