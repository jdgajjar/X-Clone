// Handles search for users and posts
async function handleSearch(query) {
  const searchBar = document.getElementById('search-bar');
  if (!query.trim()) {
    // Optionally clear results if query is empty
    displaySearchResults([]);
    return;
  }
  try {
    const res = await fetch(`/search?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    displaySearchResults(data);
  } catch (err) {
    console.error('Search error:', err);
  }
}

// Display search results in a dropdown or modal
function displaySearchResults(results) {
  let dropdown = document.getElementById('search-dropdown');
  if (!dropdown) {
    dropdown = document.createElement('div');
    dropdown.id = 'search-dropdown';
    dropdown.className = 'absolute left-0 right-0 mt-2 bg-[#16181C] border border-gray-700 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto';
    document.querySelector('.relative.w-40, .sm\:w-56, .md\:w-64, .lg\:w-72, .xl\:w-80').appendChild(dropdown);
  }
  if (!results.length) {
    dropdown.innerHTML = '<div class="p-4 text-gray-400">No results found</div>';
    return;
  }
  dropdown.innerHTML = results.map(item => {
    if (item.type === 'user') {
      return `<a href="/profile/${item.username}" class="block px-4 py-2 hover:bg-[#202327] text-white">👤 ${item.username}</a>`;
    } else if (item.type === 'post') {
      return `<a href="/post/${item._id}" class="block px-4 py-2 hover:bg-[#202327] text-white">📝 ${item.content.substring(0, 50)}...</a>`;
    }
    return '';
  }).join('');
}

function handleSearchSubmit(event) {
  event.preventDefault();
  const input = document.getElementById('search-bar');
  const query = input.value.trim();
  if (query) {
    window.location.href = `/search?q=${encodeURIComponent(query)}`;
  }
  return false;
}

document.addEventListener('click', function(e) {
  const dropdown = document.getElementById('search-dropdown');
  if (dropdown && !dropdown.contains(e.target) && e.target.id !== 'search-bar') {
    dropdown.remove();
  }
});
