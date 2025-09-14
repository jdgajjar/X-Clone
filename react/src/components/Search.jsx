import React from "react";


const Search = ({ results = [], onProfileClick }) => {
  const [query, setQuery] = React.useState("");
  const [inputValue, setInputValue] = React.useState("");
  const navigate = window && window.location ? null : undefined;

  React.useEffect(() => {
    // Set input value from URL query param on mount
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q') || '';
    setInputValue(q);
    setQuery(q);
  }, []);
  

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      window.location.href = `/user/search?q=${encodeURIComponent(inputValue.trim())}`;
    }
  };

  return (
    <div className="bg-black text-white min-h-screen">
      <div className="max-w-2xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Search</h1>
        <form onSubmit={handleSearch} className="mb-8 flex relative">
          <span className="absolute left-3 top-2.5 text-gray-500">
            <span className="material-symbols-outlined">search</span>
          </span>
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Search users or posts..."
            className="flex-1 px-4 py-2 bg-[#202327] text-white border border-transparent focus:border-[#1d9bf0] focus:bg-black rounded-l-full pl-10 pr-4 outline-none transition-colors"
            style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
            autoComplete="off"
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
        <main>
          <div id="search-results">
            {results.length > 0 ? (
              results.map((item, idx) =>
                item.type === 'user' ? (
                  <button
                    key={idx}
                    onClick={() => onProfileClick && onProfileClick(item.username)}
                    className="block w-full text-left px-4 py-3 mb-2 rounded-lg bg-[#16181C] hover:bg-[#202327] transition"
                  >
                    <span className="material-symbols-outlined align-middle">person</span>
                    <span className="ml-2 font-semibold">
                      {item.username}
                      {item.IsVerified && (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 50 50" className="inline-block align-middle ml-1" style={{ verticalAlign: 'middle' }}>
                          <path fill="#1DA1F2" d="M45.103,24.995l3.195-6.245-5.892-3.807-0.354-7.006-7.006-0.35-3.81-5.89-6.242,3.2-6.245-3.196-3.806,5.893L7.938,7.948l-0.352,7.007-5.89,3.81,3.2,6.242L1.702,31.25l5.892,3.807,0.354,7.006,7.006,0.35,3.81,5.891,6.242-3.2,6.245,3.195,3.806-5.893,7.005-0.354,0.352-7.006,5.89-3.81L45.103,24.995z M22.24,32.562l-6.82-6.819,2.121-2.121,4.732,4.731,10.202-9.888,2.088,2.154L22.24,32.562z" />
                        </svg>
                      )}
                    </span>
                  </button>
                ) : (
                  <a
                    key={idx}
                    href={`/post/${item._id}`}
                    className="block px-4 py-3 mb-2 rounded-lg bg-[#16181C] hover:bg-[#202327] transition"
                  >
                    <span className="material-symbols-outlined align-middle">article</span>
                    <span className="ml-2">{item.content?.substring(0, 80)}...</span>
                  </a>
                )
              )
            ) : (
              <div className="text-gray-400">No results found.</div>
            )}
          </div>
        </main>
        <a href="/" className="mt-8 inline-block text-blue-400 hover:underline">Back to Home</a>
      </div>
    </div>
  );
};

export default Search;
