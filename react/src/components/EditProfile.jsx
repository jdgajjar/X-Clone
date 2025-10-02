import React, { useState } from "react";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { useNavigate } from "react-router-dom";
import { editProfileThunk } from "../config/redux/action/profileAction";
import Loading from "./Loading";

const EditProfile = ({ user, onCancel }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { loading } = useSelector(state => ({ loading: state.profile?.loading }), shallowEqual);
  
  const [form, setForm] = useState({
    username: user.username || "",
    email: user.email || "",
  });
  
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [coverPhoto, setCoverPhoto] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [localLoading, setLocalLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleProfilePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }

      setProfilePhoto(file);
      
      const reader = new FileReader();
      reader.onload = (e) => setProfilePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleCoverPhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }

      setCoverPhoto(file);
      
      const reader = new FileReader();
      reader.onload = (e) => setCoverPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const removeProfilePhoto = () => {
    setProfilePhoto(null);
    setProfilePreview(null);
    document.getElementById('profilePhoto').value = '';
  };

  const removeCoverPhoto = () => {
    setCoverPhoto(null);
    setCoverPreview(null);
    document.getElementById('coverPhoto').value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalLoading(true);
    
    try {
      const formData = {
        ...form,
        profilePhoto,
        coverPhoto
      };
      
      const resultAction = await dispatch(editProfileThunk(formData));
      
      if (editProfileThunk.fulfilled.match(resultAction)) {
        navigate(`/profile/${form.username}`);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLocalLoading(false);
    }
  };

  const showLoading = loading || localLoading;

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
      <h2 className="text-xl font-bold text-white mb-6">Edit Profile</h2>
      
      {showLoading ? (
        <div className="flex justify-center py-8">
          <Loading />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={form.username}
              onChange={handleChange}
              className="w-full bg-transparent border border-gray-700 rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Username"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full bg-transparent border border-gray-700 rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Email"
              required
            />
          </div>

          {/* Profile Image Upload */}
          <div>
            <label htmlFor="profilePhoto" className="block text-sm font-medium text-gray-300 mb-2">
              Profile Image
            </label>
            <input
              type="file"
              id="profilePhoto"
              name="profilePhoto"
              accept="image/*"
              className="block w-full text-sm text-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 bg-gray-800 border border-gray-700 rounded-lg cursor-pointer"
              onChange={handleProfilePhotoChange}
            />
            
            {profilePreview ? (
              <div className="mt-3 relative">
                <img 
                  src={profilePreview} 
                  alt="Profile Preview" 
                  className="w-24 h-24 rounded-full object-cover"
                />
                <button
                  type="button"
                  onClick={removeProfilePhoto}
                  className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-700"
                >
                  ×
                </button>
              </div>
            ) : user.profilePhoto?.url && (
              <div className="mt-3">
                <img 
                  src={user.profilePhoto.url} 
                  alt="Current Profile" 
                  className="w-24 h-24 rounded-full object-cover"
                />
                <p className="text-sm text-gray-400 mt-1">Current profile image</p>
              </div>
            )}
          </div>

          {/* Cover Image Upload */}
          <div>
            <label htmlFor="coverPhoto" className="block text-sm font-medium text-gray-300 mb-2">
              Cover Image
            </label>
            <input
              type="file"
              id="coverPhoto"
              name="coverPhoto"
              accept="image/*"
              className="block w-full text-sm text-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 bg-gray-800 border border-gray-700 rounded-lg cursor-pointer"
              onChange={handleCoverPhotoChange}
            />
            
            {coverPreview ? (
              <div className="mt-3 relative">
                <img 
                  src={coverPreview} 
                  alt="Cover Preview" 
                  className="w-full h-32 rounded-lg object-cover"
                />
                <button
                  type="button"
                  onClick={removeCoverPhoto}
                  className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-700"
                >
                  ×
                </button>
              </div>
            ) : user.coverPhoto?.url && (
              <div className="mt-3">
                <img 
                  src={user.coverPhoto.url} 
                  alt="Current Cover" 
                  className="w-full h-32 rounded-lg object-cover"
                />
                <p className="text-sm text-gray-400 mt-1">Current cover image</p>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-6">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={showLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {showLoading ? 'Updating...' : 'Update Profile'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default EditProfile;
