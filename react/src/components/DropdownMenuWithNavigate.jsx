import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Loading from "./Loading";
import { useDispatch } from "react-redux";
import { deletePostThunk } from "../config/redux/action/postAction";

const DropdownMenuWithNavigate = ({ postId }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showFullLoading, setShowFullLoading] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleEdit = () => {
    setOpen(false);
    navigate(`/post/${postId}/edit`);
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this post? This will also delete all comments and likes.")) return;
    setOpen(false);
    setShowFullLoading(true);
    try {
      const resultAction = await dispatch(deletePostThunk(postId));
      if (deletePostThunk.fulfilled.match(resultAction)) {
        setTimeout(() => navigate("/"), 1000);
      } else {
        alert("Failed to delete post");
        setShowFullLoading(false);
      }
    } catch (err) {
      alert("Failed to delete post");
      setShowFullLoading(false);
    }
  };

  if (showFullLoading) return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.95)' }}>
      <Loading />
    </div>
  );

  return (
    <div className="relative" ref={menuRef}>
      <button
        className="ml-0 p-1 text-gray-500 rounded-full hover:bg-[#1d9bf0]/10 hover:text-[#1d9bf0] transition-colors action-hover"
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="material-symbols-outlined text-[16px]">more_horiz</span>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-32 bg-[#222] border border-gray-700 rounded-lg shadow-lg z-20">
          <button
            className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-[#1d9bf0]/20 hover:text-[#1d9bf0]"
            onClick={handleEdit}
          >
            Edit
          </button>
          <button
            className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-900/30 hover:text-red-500"
            onClick={handleDelete}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default DropdownMenuWithNavigate;
