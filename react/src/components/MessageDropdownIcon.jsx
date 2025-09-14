import React from "react";

const MessageDropdownIcon = ({ onClick }) => (
  <button
    className="ml-2 p-1 text-gray-500 rounded-full hover:bg-[#1d9bf0]/10 hover:text-[#1d9bf0] transition-colors action-hover"
    type="button"
    aria-haspopup="true"
    aria-label="Show message actions"
    onClick={onClick}
    tabIndex={0}
    style={{ background: 'transparent', border: 'none', outline: 'none', cursor: 'pointer' }}
  >
    <span className="material-symbols-outlined text-[18px]">more_horiz</span>
  </button>
);

export default MessageDropdownIcon;
