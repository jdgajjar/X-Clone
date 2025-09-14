import React, { useState } from "react";
import Loading from "./Loading";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { editPostThunk } from "../config/redux/action/postAction";
import { fetchPostThunk } from "../config/redux/action/postAction";


const EditPost = ({ user }) => {
  const params = useParams();
  const id = params.id;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  // Debug: log params and id
  React.useEffect(() => {
    // eslint-disable-next-line no-console
    console.log('EditPost useParams:', params, 'id:', id);
  }, [params, id]);
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [deletingImage, setDeletingImage] = useState(false);
  const [imageMarkedForDelete, setImageMarkedForDelete] = useState(false);

  React.useEffect(() => {
    if (!id) return;
    async function fetchPost() {
      try {
        const resultAction = await dispatch(fetchPostThunk(id));
        if (fetchPostThunk.fulfilled.match(resultAction)) {
          const data = resultAction.payload;
          setPost(data.post || data);
          setContent((data.post || data).content || "");
        } else {
          setError(resultAction.payload || "Post not found");
        }
      } catch (err) {
        setError("Post not found");
      } finally {
        setLoading(false);
      }
    }
    fetchPost();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    if (!id) {
      setError("Invalid post ID.");
      setLoading(false);
      return;
    }
    const formData = new FormData();
    formData.append("content", content);
    if (image) formData.append("image", image);
    if (imageMarkedForDelete) formData.append("deleteImage", "1");
    try {
      const resultAction = await dispatch(editPostThunk({ id, formData }));
      if (editPostThunk.fulfilled.match(resultAction)) {
        setSuccess("Post updated successfully!");
        setTimeout(() => navigate(`/post/${id}`), 1000);
      } else {
        setError(resultAction.payload || "Failed to update post");
        setLoading(false);
      }
    } catch (err) {
      setError("Failed to update post");
      setLoading(false);
    }
  };

  const handleDeleteImage = () => {
    setImageMarkedForDelete(true);
  };

  if (loading) return <Loading />;
  if (!id) return <div className="text-center text-red-500 py-10">Invalid or missing post ID in URL.</div>;
  if (error) return <div className="text-center text-red-500 py-10">{error}</div>;
  if (!post) return <Loading />;
  return (
    <div className="bg-black text-white min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-xl bg-[#16181C] rounded-lg p-6 shadow-md">
        <h1 className="text-2xl font-bold mb-6">Edit Post</h1>
        {success && <div className="text-green-400 mb-4">{success}</div>}
        {error && <div className="text-red-400 mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="mb-6">
            <label htmlFor="edit-content" className="block text-sm font-medium text-gray-300 mb-2">Edit Post</label>
            <textarea
              name="content"
              id="edit-content"
              rows={6}
              required
              className="w-full p-4 bg-gray-800 text-gray-200 border border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-700 focus:border-gray-700 placeholder-gray-500 resize-none shadow-sm"
              placeholder="What's on your mind?"
              value={content}
              onChange={e => setContent(e.target.value)}
            />
          </div>
          {post?.image?.url && !imageMarkedForDelete && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-500 mb-2">Current Image</label>
              <div className="relative w-full max-w-md rounded-lg overflow-hidden shadow-sm border border-gray-300 bg-gray-50">
                <img src={post.image.url} alt="Post Image" className="w-full h-auto object-cover rounded-md transition-transform duration-300 hover:scale-105" />
                <button type="button" title="Delete Image" onClick={handleDeleteImage} className="absolute top-2 right-2 bg-black bg-opacity-70 hover:bg-red-600 text-white rounded-full p-1 transition-colors border-2 border-transparent hover:border-red-500 z-10">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}
          <div className="mb-6">
            <label htmlFor="image" className="block text-sm font-medium text-gray-300 mb-2">Change Image</label>
            <input
              type="file"
              name="image"
              id="image"
              accept="image/*"
              className="block w-full text-sm text-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 bg-gray-800 border border-gray-700 rounded-lg cursor-pointer"
              onChange={e => setImage(e.target.files[0])}
            />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-2 sm:gap-4">
            <button
              type="button"
              className="text-red-400 hover:text-red-500 font-medium transition text-center sm:text-left"
              onClick={() => {
                setLoading(true);
                setImageMarkedForDelete(false);
                setTimeout(() => navigate(`/post/${id}`), 300);
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-full transition text-center sm:text-left"
              disabled={!id || loading || !content.trim()}
            >
              Update
            </button>
           
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPost;
