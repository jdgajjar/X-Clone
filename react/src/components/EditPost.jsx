import React, { useState } from "react";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { useNavigate } from "react-router-dom";
import { editProfileThunk } from "../config/redux/action/profileAction";
import Loading from "./Loading";


const EditProfile = ({ user, onCancel }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // Use shallowEqual to prevent unnecessary rerenders
  const { loading } = useSelector(state => ({ loading: state.profile?.loading }), shallowEqual);
  const [form, setForm] = useState({
    username: user.username || "",
    email: user.email || "",
    profilePhoto: null,
    coverPhoto: null,
  });
  const [localLoading, setLocalLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalLoading(true);
    const resultAction = await dispatch(editProfileThunk(form));
    setLocalLoading(false);
    if (editProfileThunk.fulfilled.match(resultAction)) {
      navigate(`/profile/${form.username}`);
    }
  };

  const showLoading = loading || localLoading;

  return (
    <div className="bg-black text-white min-h-screen font-sans">
      <header className="flex items-center p-4 border-b border-gray-700">
        <h1 className="text-2xl font-bold">Edit Profile</h1>
      </header>
      {showLoading ? (
        <div className="flex items-center justify-center min-h-[80vh]">
          <Loading />
        </div>
      ) : (
        <main className="flex justify-center mt-8">
          <form className="bg-black w-full max-w-md p-6 space-y-6" onSubmit={handleSubmit} encType="multipart/form-data">
            {/* Username */}
            <div className="space-y-2">
              <label htmlFor="username" className="text-gray-400 text-sm">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={form.username}
                onChange={handleChange}
                className="w-full bg-transparent border border-gray-700 rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Username"
              />
            </div>
            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-gray-400 text-sm">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full bg-transparent border border-gray-700 rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Email"
              />
            </div>
            {/* Profile Image Upload */}
            <div className="space-y-2">
              <label htmlFor="profilePhoto" className="text-gray-400 text-sm">Profile Image</label>
              <input
                type="file"
                id="profilePhoto"
                name="profilePhoto"
                accept="image/*"
                className="block w-full text-sm text-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 bg-gray-800 border border-gray-700 rounded-lg cursor-pointer"
                onChange={handleFileChange}
              />
              {user.profilePhoto?.url && (
                <img src={user.profilePhoto.url} alt="Profile" className="w-20 h-20 rounded-full mt-2" />
              )}
            </div>
            {/* Cover Image Upload */}
            <div className="space-y-2">
              <label htmlFor="coverPhoto" className="text-gray-400 text-sm">Cover Image</label>
              <input
                type="file"
                id="coverPhoto"
                name="coverPhoto"
                accept="image/*"
                className="block w-full text-sm text-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 bg-gray-800 border border-gray-700 rounded-lg cursor-pointer"
                onChange={handleFileChange}
              />
              {user.coverPhoto?.url && (
                <img src={user.coverPhoto.url} alt="Cover" className="w-full h-32 object-cover mt-2 rounded" />
              )}
            </div>
            {/* Buttons */}
            <div className="flex justify-between pt-4">
              <button type="button" onClick={onCancel} className="px-6 py-2 bg-transparent border border-gray-700 rounded-full text-white hover:bg-gray-800 transition">
                Cancel
              </button>
              <button type="submit" className="px-6 py-2 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition">
                Save
              </button>
            </div>
          </form>
        </main>
      )}
    </div>
  );
};

export default EditProfile;
