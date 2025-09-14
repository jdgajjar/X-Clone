// File: src/components/HomeHead.jsx

import React from 'react';

const HomeHead = ({ onToggleMobileNav }) => {
  return (
    <div className="sticky top-0 z-10 bg-black/90 backdrop-blur-md border-b border-gray-800">
      <div className="flex items-center justify-between w-full px-4 h-14">
        {/* Logo */}
        <div className="flex items-center cursor-pointer ml-[10%]" onClick={onToggleMobileNav}>
          <svg viewBox="0 0 24 24" aria-hidden="true" className="w-7 h-7">
            <g>
              <path
                fill="currentColor"
                d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
              ></path>
            </g>
          </svg>
        </div>

        {/* Timeline Header */}
        <div className="hidden lg:flex md:ml-[15%] lg:w-[25%] md:justify-between">
          <button
            onClick={() => {}}
            className="relative ml-[40%] font-bold text-white transition-colors tab-button"
            data-tab="byjenish"
          >
            by Jenish
            <div className="ml-2 absolute bottom-0 h-1 w-14 bg-x-blue rounded-full tab-indicator"></div>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative w-40 sm:w-56 md:w-64 lg:w-72 xl:w-80 mr-[0px] sm:mr-0 lg:mr-[10vw]">
          <form
            className="flex"
            action="/user/search"
            method="GET"
            onSubmit={e => {
              // Allow both Enter and button click to submit
              if (!e.target.q.value.trim()) {
                e.preventDefault();
              }
            }}
          >
            
            <input
              type="text"
              id="search-bar"
              name="q"
              placeholder="Search users or posts"
              className="w-full bg-[#202327] border border-transparent focus:border-[#1d9bf0] focus:bg-black rounded-l-full py-2 pl-10 pr-4 outline-none transition-colors"
              autoComplete="off"
              style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
            />
            <button
              type="submit"
              className="flex items-center px-4 py-2 font-bold rounded-r-full transition-colors focus:outline-none"
              style={{
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0,
                background: 'linear-gradient(90deg, #23272f 60%, #1d1f23 100%)',
                color: '#fff',
                border: '1px solid #23272f',
                boxShadow: '0 1px 4px 0 rgba(0,0,0,0.10)'
              }}
              tabIndex={0}
            >
              <span className="material-symbols-outlined text-lg">search</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default HomeHead;
