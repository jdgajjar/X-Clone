import React from "react";

const NotFound = ({ error }) => (
  <div className="bg-black text-white min-h-screen flex items-center justify-center">
    <div className="text-center">
      <svg viewBox="0 0 24 24" aria-hidden="true" className="w-12 h-12 mx-auto mb-4">
        <g>
          <path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
        </g>
      </svg>
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="text-xl text-gray-400 mb-8">{error}</p>
      <a href="/" className="inline-block bg-[#1d9bf0] hover:bg-[#1A8CD8] text-white font-bold py-2 px-6 rounded-full transition-colors">Return Home</a>
    </div>
  </div>
);

export default NotFound;
