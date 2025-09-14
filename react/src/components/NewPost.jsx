import React, { useState } from "react";
import Loading from "./Loading";

const NewPost = ({ onSubmit, onCancel }) => {
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (onSubmit) {
      await onSubmit({ content, image });
    }
    setLoading(false);
  };

  if (loading) return <Loading />;

  return (
    <div className="bg-black text-white min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-xl bg-[#16181C] rounded-xl p-6 shadow-lg border border-gray-800">
        <h1 className="text-2xl font-bold mb-6 text-white">New Post</h1>
        <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
          {/* Image Upload */}
          <div>
            <label htmlFor="image" className="block text-sm font-medium text-gray-300 mb-2">Upload Image</label>
            <input
              type="file"
              name="image"
              id="image"
              accept="image/*"
              className="w-full text-sm text-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 bg-gray-800 border border-gray-700 rounded-lg cursor-pointer"
              onChange={e => setImage(e.target.files[0])}
            />
          </div>
          {/* Textarea */}
          <div>
            <label htmlFor="post-content" className="block text-sm font-medium text-gray-300 mb-2">What's happening?</label>
            <textarea
              name="content"
              id="post-content"
              rows={6}
              placeholder="Share your thoughts..."
              required
              className="w-full p-4 bg-gray-800 text-gray-200 border border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500 resize-none shadow-sm"
              value={content}
              onChange={e => setContent(e.target.value)}
            />
          </div>
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-2 sm:gap-4 pt-2">
            <button type="button" onClick={onCancel} className="text-red-400 hover:text-red-500 font-medium transition duration-150 text-center sm:text-left">Cancel</button>
            <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-full transition duration-150 text-center sm:text-left">Post</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewPost;
