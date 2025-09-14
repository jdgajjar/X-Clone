// Register thunk
export const RegisterUser = createAsyncThunk(
  "/register",
  async (user, thunkAPI) => {
    try {
      const response = await clientServer.post("/register", {
        username: user.username,
        password: user.password,
        email: user.email,
      });
      if (response && response.data && response.data.user) {
        // Optionally store token if backend returns it
        if (response.data.token) {
          localStorage.setItem("token", response.data.token);
        }
        return thunkAPI.fulfillWithValue({ user: response.data.user, token: response.data.token });
      } else {
        const msg = typeof response?.data === 'string' ? response.data : (response?.data?.message || "Registration failed");
        return thunkAPI.rejectWithValue(msg);
      }
    } catch (error) {
      if (error.response && error.response.status === 409) {
        return thunkAPI.rejectWithValue({
          message: error.response.data?.message || "User already exists. Please use a different email or username."
        });
      }
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Registration failed, please try again.");
    }
  }
);
import { createAsyncThunk } from "@reduxjs/toolkit";
import { clientServer } from "../../../../config/clientServer";
// Login thunk
export const LoginUser = createAsyncThunk(
  "/login",
  async (user, thunkAPI) => {
    try {
      const response = await clientServer.post("/login", {
        email: user.email,
        password: user.password,
      });
      if (response && response.data && response.data.token) {
        localStorage.setItem("token", response.data.token);
        return thunkAPI.fulfillWithValue({ user: response.data.user, token: response.data.token });
      } else {
        const msg = typeof response?.data === 'string' ? response.data : (response?.data?.error || "Login failed");
        return thunkAPI.rejectWithValue(msg);
      }
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.error || "Login failed");
    }
  }
);





