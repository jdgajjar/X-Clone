import React, { useState } from "react";
import Loading from "./Loading";

const NewPost = ({ onSubmit, onCancel }) => {
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
      }
      
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        alert('Image size must be less than 10MB');
        return;
      }

      setImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    // Reset file input
    document.getElementById('image').value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      alert('Please enter some content for your post');
      return;
    }

    setLoading(true);
    
    try {
      if (onSubmit) {
        await onSubmit({ content: content.trim(), image });
      }
      
      // Reset form
      setContent("");
      setImage(null);
      setImagePreview(null);
      document.getElementById('image').value = '';
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 mb-6">
      <h2 className="text-xl font-bold text-white mb-4">New Post</h2>
      
      <form onSubmit={handleSubmit}>
        {/* Image Upload */}
        <div className="mb-4">
          <label htmlFor="image" className="block text-sm font-medium text-gray-300 mb-2">
            Upload Image
          </label>
          <input
            type="file"
            name="image"
            id="image"
            accept="image/*"
            className="w-full text-sm text-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 bg-gray-800 border border-gray-700 rounded-lg cursor-pointer"
            onChange={handleImageChange}
          />
          
          {/* Image Preview */}
          {imagePreview && (
            <div className="mt-3 relative">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="max-w-full h-auto rounded-lg max-h-64 object-cover"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-700"
              >
                ×
              </button>
            </div>
          )}
        </div>

        {/* Content Textarea */}
        <div className="mb-4">
          <label htmlFor="post-content" className="block text-sm font-medium text-gray-300 mb-2">
            What's happening?
          </label>
          <textarea
            name="content"
            id="post-content"
            rows={6}
            placeholder="Share your thoughts..."
            required
            className="w-full p-4 bg-gray-800 text-gray-200 border border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500 resize-none shadow-sm"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <div className="text-right text-sm text-gray-400 mt-1">
            {content.length}/280
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
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
            disabled={!content.trim() || loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Posting...' : 'Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewPost;
