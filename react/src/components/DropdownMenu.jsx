import React, { useState, useRef, useEffect } from "react";

const DropdownMenu = ({ onEdit, onDelete }) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

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
            onClick={() => { setOpen(false); onEdit && onEdit(); }}
          >
            Edit
          </button>
          <button
            className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-900/30 hover:text-red-500"
            onClick={() => { setOpen(false); onDelete && onDelete(); }}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;
