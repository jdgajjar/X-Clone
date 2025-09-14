import React from 'react'
import { clientServer } from '../config/clientServer';

const MessagesMobile = ({
  selectedUser,
  setSelectedId,
  showHeaderMenuMobile,
  setShowHeaderMenuMobile,
  currentUserId,
  setMessages,
  setUsers,
  setSortedUsers,
  selectedId,
  messages,
  setActiveMsgIdx,
  activeMsgIdx,
  openDropdownIdx,
  setOpenDropdownIdx,
  editingMsgIdx,
  setEditingMsgIdx,
  editingMsgContent,
  setEditingMsgContent,
  setDeleteModal,
  setAllMessages,
  allMessages,
  isMobile,
  chatContainerRef,
  showScrollToBottom,
  scrollToBottom,
  newMessage,
  setNewMessage,
  sending,
  setMessagedUsers,
  handleSend,
  searchTerm,
  setSearchTerm,
  handleSearch,
  sortedUsers,
  unreadCounts,
  isChatEmpty
}) => {
  return selectedUser ? (
        // Show only chat main part on mobile when a user is selected
        <main className="flex-1 flex flex-col w-full">
          <header className="p-4 border-b border-[#23272f] bg-[#16181C] font-bold text-lg flex items-center gap-2 whitespace-nowrap overflow-hidden relative">
            {/* Back button for mobile */}
            <button
              className="mr-2 flex items-center text-[#1d9bf0] hover:text-blue-400 transition"
              title="Back"
              onClick={() => setSelectedId(null)}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 28 }}>arrow_back</span>
            </button>
            <span className="flex items-center gap-2 min-w-0">
              {selectedUser && selectedUser.profilePhoto && selectedUser.profilePhoto.url ? (
                <img
                  src={selectedUser.profilePhoto.url}
                  alt={selectedUser.username}
                  className="w-7 h-7 rounded-full object-cover border border-gray-700"
                  style={{ minWidth: 28, minHeight: 28 }}
                />
              ) : (
                <span className="material-symbols-outlined">person</span>
              )}
              <span className="flex items-center gap-1 text-ellipsis overflow-hidden min-w-0">
                <span className="truncate max-w-[120px]">{selectedUser ? selectedUser.username : ''}</span>
                {selectedUser && selectedUser.IsVerified && (
                  <span title="Verified" className="inline-block align-middle">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      x="0px"
                      y="0px"
                      width="20"
                      height="20"
                      viewBox="0 0 50 50"
                      className="inline-block align-middle ml-1"
                      style={{ verticalAlign: "middle" }}
                    >
                      <path
                        fill="#1DA1F2"
                        d="M45.103,24.995l3.195-6.245l-5.892-3.807l-0.354-7.006l-7.006-0.35l-3.81-5.89l-6.242,3.2l-6.245-3.196l-3.806,5.893 L7.938,7.948l-0.352,7.007l-5.89,3.81l3.2,6.242L1.702,31.25l5.892,3.807l0.354,7.006l7.006,0.35l3.81,5.891l6.242-3.2l6.245,3.195 l3.806-5.893l7.005-0.354l0.352-7.006l5.89-3.81L45.103,24.995z M22.24,32.562l-6.82-6.819l2.121-2.121l4.732,4.731l10.202-9.888 l2.088,2.154L22.24,32.562z"
                      ></path>
                    </svg>
                  </span>
                )}
              </span>
            </span>
            {/* 3-dot menu for mobile header */}
            <div style={{ marginLeft: 'auto', position: 'relative', zIndex: 2000 }}>
              <button
                className="flex items-center justify-center p-2 rounded-full hover:bg-[#23272f] focus:outline-none"
                style={{ width: 36, height: 36 }}
                onClick={() => setShowHeaderMenuMobile(prev => !prev)}
                tabIndex={0}
                aria-label="More options"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 28 }}>more_vert</span>
              </button>
              {showHeaderMenuMobile && (
                <div
                  style={{
                    position: 'fixed',
                    top: 56, // header height
                    right: 16,
                    background: '#23272f',
                    color: '#fff',
                    borderRadius: 10,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
                    minWidth: 140,
                    zIndex: 3000,
                    padding: '8px 0',
                    border: '1px solid #1d9bf0',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <button
                        className="w-full px-5 py-2 hover:bg-[#1d9bf0] hover:text-white transition"
                        style={{ background: 'none', border: 'none', color: '#fff', fontSize: 16, cursor: 'pointer', textAlign: 'center', justifyContent: 'center', display: 'flex' }}
                        onClick={async () => {
                          setShowHeaderMenuMobile(false);
                          if (!selectedUser) return;
                          if (window.confirm('Are you sure you want to empty this chat?')) {
                            try {
                              const res = await clientServer.post('/api/messages/empty-chat-for-me', { chatUserId: selectedUser._id });
                              if (res && res.status === 200) {
                                setMessages([]);
                              } else {
                                alert('Failed to empty chat.');
                              }
                            } catch (e) {
                              alert('Failed to empty chat.');
                            }
                          }
                        }}
                      >
                        Empty chat
                      </button>
                      {selectedUser && selectedUser.blockedBy && selectedUser.blockedBy.includes(currentUserId) ? (
                        <button
                          className="w-full px-5 py-2 hover:bg-green-500 hover:text-white transition"
                          style={{ background: 'none', border: 'none', color: '#fff', fontSize: 16, cursor: 'pointer', textAlign: 'center', justifyContent: 'center', display: 'flex' }}
                          onClick={async () => {
                            setShowHeaderMenuMobile(false);
                            if (!selectedUser) return;
                            if (window.confirm(`Unblock @${selectedUser.username}? They will be able to message you again.`)) {
                              try {
                                const res = await clientServer.post('/api/users/unblock', { userId: selectedUser._id });
                                const data = res.data;
                                if (res && res.status === 200) {
                                  // Real-time update: update selectedUser and sortedUsers with returned user objects
                                  if (data && data.targetUser && data.currentUser) {
                                    if (selectedId === data.targetUser._id) {
                                      setUsers(prevUsers => prevUsers.map(u => u._id === data.targetUser._id ? { ...u, ...data.targetUser } : u._id === data.currentUser._id ? { ...u, ...data.currentUser } : u));
                                    }
                                    setSortedUsers(prev => prev.map(u => u._id === data.targetUser._id ? { ...u, ...data.targetUser } : u._id === data.currentUser._id ? { ...u, ...data.currentUser } : u));
                                  }
                                  alert('User unblocked.');
                                } else if (data && data.message && data.message.toLowerCase().includes('unblocked')) {
                                  // If already unblocked, treat as success and update UI, but do NOT show any alert
                                  if (data.targetUser && data.currentUser) {
                                    if (selectedId === data.targetUser._id) {
                                      setUsers(prevUsers => prevUsers.map(u => u._id === data.targetUser._id ? { ...u, ...data.targetUser } : u._id === data.currentUser._id ? { ...u, ...data.currentUser } : u));
                                    }
                                    setSortedUsers(prev => prev.map(u => u._id === data.targetUser._id ? { ...u, ...data.targetUser } : u._id === data.currentUser._id ? { ...u, ...data.currentUser } : u));
                                  }
                                  // No alert here
                                } else {
                                  alert(data && data.message ? data.message : 'Failed to unblock user.');
                                }
                              } catch (e) {
                                alert(e);
                              }
                            }
                          }}
                        >
                          Unblock user
                        </button>
                      ) : (
                        <button
                          className="w-full px-5 py-2 hover:bg-red-500 hover:text-white transition"
                          style={{ background: 'none', border: 'none', color: '#fff', fontSize: 16, cursor: 'pointer', textAlign: 'center', justifyContent: 'center', display: 'flex' }}
                          onClick={async () => {
                            setShowHeaderMenuMobile(false);
                            if (!selectedUser) return;
                            if (window.confirm(`Block @${selectedUser.username}? They won't be able to message you, and you won't be able to message them.`)) {
                              try {
                                const res = await clientServer.post('/api/users/block', { userId: selectedUser._id });
                                const data = res.data;
                                if (res && res.status === 200) {
                                  // Real-time update: update selectedUser and sortedUsers with returned user objects
                                  if (data && data.targetUser && data.currentUser) {
                                    if (selectedId === data.targetUser._id) {
                                      setUsers(prevUsers => prevUsers.map(u => u._id === data.targetUser._id ? { ...u, ...data.targetUser } : u._id === data.currentUser._id ? { ...u, ...data.currentUser } : u));
                                    }
                                    setSortedUsers(prev => prev.map(u => u._id === data.targetUser._id ? { ...u, ...data.targetUser } : u._id === data.currentUser._id ? { ...u, ...data.currentUser } : u));
                                  }
                                  alert('User blocked. You can unblock from their profile.');
                                } else if (data && data.message && data.message.toLowerCase().includes('blocked')) {
                                  // If already blocked, treat as success and update UI, but do NOT show any alert
                                  if (data.targetUser && data.currentUser) {
                                    if (selectedId === data.targetUser._id) {
                                      setUsers(prevUsers => prevUsers.map(u => u._id === data.targetUser._id ? { ...u, ...data.targetUser } : u._id === data.currentUser._id ? { ...u, ...data.currentUser } : u));
                                    }
                                    setSortedUsers(prev => prev.map(u => u._id === data.targetUser._id ? { ...u, ...data.targetUser } : u._id === data.currentUser._id ? { ...u, ...data.currentUser } : u));
                                  }
                                  // No alert here
                                } else {
                                  alert(data && data.message ? data.message : 'Failed to block user.');
                                }
                              } catch (e) {
                                alert(e);
                              }
                            }
                          }}
                        >
                          Block user
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </header>
            <div style={{position:'relative', flex:1, display:'flex', flexDirection:'column'}}>
              <div
                ref={chatContainerRef}
                className="flex-1 p-6 space-y-4 bg-black custom-scrollbar"
                style={{
                  paddingBottom: isMobile ? 80 : undefined,
                  maxHeight: 'calc(100vh - 196px)', // header (56px) + input (60px) + padding
                  minHeight: 200,
                  height: '100%',
                  overflowY: 'auto',
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#1d9bf0 #23272f',
                  borderRadius: 12,
                }}
              >
                {messages.length > 0 ? (
                  messages
                    .filter(msg => !msg.deletedFor || !msg.deletedFor.includes(currentUserId))
                    .map((msg, idx) => {
                      const isSender = msg.sender === currentUserId;
                      return (
                        <div
                          key={msg._id || idx}
                          className={`flex w-full msg-row ${isSender ? 'justify-end' : 'justify-start'}`}
                          style={{ alignItems: 'center' }}
                          onClick={() => {
                            if (isSender) setActiveMsgIdx(activeMsgIdx === idx ? null : idx);
                          }}
                        >
                          <div
                            className={`flex items-center ${isSender ? 'flex-row-reverse' : ''}`}
                            style={{ width: 'fit-content', marginLeft: isSender ? 'auto' : 0, marginRight: isSender ? 0 : 'auto' }}
                          >
                            <div
                              className={`msg-bubble group relative px-4 py-2 rounded-2xl break-words ${isSender ? 'bg-[#1d9bf0] text-white' : 'bg-[#23272f] text-gray-200'}`}
                              style={{
                                maxWidth: isMobile ? '85vw' : '420px',
                                minWidth: '40px',
                                width: 'fit-content',
                              }}
                            >
                              {(isSender && editingMsgIdx === idx) ? (
                                <form
                                  onSubmit={async e => {
                                    e.preventDefault();
                                    if (!editingMsgContent.trim()) return;
                                    try {
                                      const res = await clientServer.post('/api/messages/edit', { messageId: msg._id, content: editingMsgContent });
                                      if (res && res.status === 200) {
                                        setMessages(prev => prev.map((m, i) => i === idx ? { ...m, content: editingMsgContent } : m));
                                        setAllMessages(prev => prev.map((m, i) => i === idx ? { ...m, content: editingMsgContent } : m));
                                        setEditingMsgIdx(null);
                                        setEditingMsgContent('');
                                      } else {
                                        alert('Failed to edit message.');
                                      }
                                    } catch (e) {
                                      alert('Failed to edit message.');
                                    }
                                  }}
                                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}
                                >
                                  <input
                                    type="text"
                                    value={editingMsgContent}
                                    onChange={e => setEditingMsgContent(e.target.value)}
                                    autoFocus
                                    style={{
                                      background: '#23272f',
                                      color: '#fff',
                                      border: '1px solid #1d9bf0',
                                      borderRadius: 8,
                                      padding: '4px 8px',
                                      fontSize: 15,
                                      width: '180px',
                                      marginBottom: 6,
                                    }}
                                    onClick={e => e.stopPropagation()}
                                  />
                                  <div
                                    style={{
                                      display: 'flex',
                                      flexDirection: isMobile ? 'column' : 'row',
                                      gap: 8,
                                      width: '100%'
                                    }}
                                  >
                                    <button
                                      type="submit"
                                      style={{
                                        background: '#22c55e', // Tailwind green-500
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: 6,
                                        padding: '8px 0',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        flex: 1,
                                        width: isMobile ? '100%' : undefined,
                                        fontSize: 15,
                                      }}
                                    >
                                      Save
                                    </button>
                                    <button
                                      type="button"
                                      style={{
                                        background: '#444',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: 6,
                                        padding: '8px 0',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        flex: 1,
                                        width: isMobile ? '100%' : undefined,
                                        fontSize: 15,
                                      }}
                                      onClick={e => {
                                        e.stopPropagation();
                                        setEditingMsgIdx(null);
                                        setEditingMsgContent('');
                                      }}
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </form>
                              ) : (
                                msg.content
                              )}
                              <div className="text-xs mt-1 text-right" style={{ minWidth: 60 }}>
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                            {/* Arrow only shows if this message is active and isSender */}
                            {isSender && activeMsgIdx === idx && (
                              <div style={{ position: 'relative', marginLeft: 6 }}>
                                <span
                                  className="msg-arrow-icon"
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    borderRadius: '50%',
                                    width: 28,
                                    height: 28,
                                    transition: 'background 0.15s',
                                    background: openDropdownIdx === idx ? 'rgba(29,155,240,0.12)' : 'transparent',
                                    boxShadow: openDropdownIdx === idx ? '0 2px 8px rgba(0,0,0,0.10)' : 'none',
                                    zIndex: 21,
                                  }}
                                  onClick={e => {
                                    e.stopPropagation();
                                    setOpenDropdownIdx(openDropdownIdx === idx ? null : idx);
                                  }}
                                  tabIndex={0}
                                  onKeyDown={e => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                      e.preventDefault();
                                      setOpenDropdownIdx(openDropdownIdx === idx ? null : idx);
                                    }
                                  }}
                                >
                                  <span className="material-symbols-outlined" style={{ fontSize: 22, color: '#fff', lineHeight: 1, background: 'transparent', margin: 0, padding: 0, cursor: 'pointer', userSelect: 'none' }}>
                                    keyboard_arrow_down
                                  </span>
                                </span>
                                {/* Dropdown menu only shows if openDropdownIdx === idx */}
                                <div
                                  className={`msg-dropdown-anim${openDropdownIdx === idx ? ' show' : ''}`}
                                  style={{
                                    position: 'absolute',
                                    top: 34,
                                    left: 0,
                                    background: '#23272f',
                                    color: '#fff',
                                    borderRadius: 10,
                                    boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
                                    minWidth: 120,
                                    marginTop: 2,
                                    zIndex: 1002,
                                    padding: '6px 0',
                                    pointerEvents: openDropdownIdx === idx ? 'auto' : 'none',
                                    opacity: openDropdownIdx === idx ? 1 : 0,
                                    transform: openDropdownIdx === idx ? 'translateY(0) scale(1)' : 'translateY(-8px) scale(0.98)',
                                    transition: 'opacity 0.18s cubic-bezier(.4,0,.2,1), transform 0.18s cubic-bezier(.4,0,.2,1)',
                                    border: openDropdownIdx === idx ? '1px solid #1d9bf0' : '1px solid transparent',
                                  }}
                                  onClick={e => e.stopPropagation()}
                                >
                                  <button
                                    style={{
                                      display: 'block',
                                      width: '100%',
                                      background: 'none',
                                      border: 'none',
                                      color: '#fff',
                                      padding: '10px 20px 10px 18px',
                                      textAlign: 'left',
                                      cursor: 'pointer',
                                      fontSize: 16,
                                      outline: 'none',
                                      transition: 'background 0.13s',
                                    }}
                                    onClick={e => {
                                      e.stopPropagation();
                                      setOpenDropdownIdx(null);
                                      setActiveMsgIdx(null);
                                      setEditingMsgIdx(idx);
                                      setEditingMsgContent(msg.content);
                                    }}
                                    onMouseDown={e => e.preventDefault()}
                                    className="msg-dropdown-btn"
                                  >
                                    Edit
                                  </button>
                                  {isSender && (
                                    <button
                                      style={{
                                        display: 'block',
                                        width: '100%',
                                        background: 'none',
                                        border: 'none',
                                        color: '#fff',
                                        padding: '10px 20px 10px 18px',
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        fontSize: 16,
                                        outline: 'none',
                                        transition: 'background 0.13s',
                                      }}
                                    onClick={e => {
                                      e.stopPropagation();
                                      setOpenDropdownIdx(null);
                                      setActiveMsgIdx(null);
                                      setDeleteModal({ open: true, msgIdx: idx, msgId: msg._id });
                                    }}
                                      onMouseDown={e => e.preventDefault()}
                                      className="msg-dropdown-btn"
                                    >
                                      Delete
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                  })
                ) : (
                  <div className="text-gray-400">No messages yet with {selectedUser.username}.</div>
                )}
              </div>
              {/* Down arrow button just above the input, visible on mobile too */}
              {showScrollToBottom && (
                <div
                  style={
                    isMobile
                      ? {
                          position: 'fixed',
                          left: 0,
                          right: 0,
                          bottom: 70, // just above input bar
                          width: '100vw',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          zIndex: 200,
                          pointerEvents: 'none', // allow input bar to be clickable
                        }
                      : {
                          width: '100%',
                          display: 'flex',
                          justifyContent: 'center',
                          position: 'absolute',
                          left: 0,
                          right: 0,
                          bottom: 16,
                          zIndex: 51,
                          pointerEvents: 'none',
                        }
                  }
                >
                  <button
                    onClick={scrollToBottom}
                    style={{
                      background: '#1d9bf0',
                      color: '#fff',
                      borderRadius: '50%',
                      width: 44,
                      height: 44,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                      margin: isMobile ? '0 auto' : '8px auto',
                      pointerEvents: 'auto',
                    }}
                    title="Scroll to latest message"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 28, fontWeight: 700 }}>
                      arrow_downward
                    </span>
                  </button>
                </div>
              )}
            </div>
            <form
              className="p-4 border-t border-[#23272f] bg-[#16181C] flex"
              style={isMobile ? { position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 20, maxWidth: '100vw' } : {}}
              onSubmit={async (e) => {
                e.preventDefault();
                if (!selectedUser || !newMessage.trim() || sending) return;
                // Add selected user to messagedUsers if not already present
                setMessagedUsers(prev => prev.includes(selectedUser._id) ? prev : [...prev, selectedUser._id]);
                await handleSend(e);
              }}
            >
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 bg-[#202327] text-white border border-transparent focus:border-[#1d9bf0] rounded-full outline-none transition-colors"
                autoComplete="off"
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                disabled={!selectedUser || sending}
                style={isMobile ? { fontSize: 16 } : {}}
              />
              <button
                type="submit"
                className="ml-2 px-4 py-2 rounded-full bg-[#1d9bf0] text-white font-bold disabled:opacity-50"
                disabled={!selectedUser || !newMessage.trim() || sending}
                style={isMobile ? { fontSize: 16 } : {}}
              >
                {sending ? 'Sending...' : 'Send'}
              </button>
            </form>
          </main>
        ) : (
          // Show only sidebar (list) on mobile if no user selected
          <aside className="w-full bg-[#16181C] flex-shrink-0">
            <div className="flex items-center p-4 border-b border-[#23272f]">
              <a href="/" className="mr-3 flex items-center text-[#1d9bf0] hover:text-blue-400 transition" title="Back">
                <span className="material-symbols-outlined" style={{ fontSize: 28 }}>arrow_back</span>
              </a>
              <h2 className="text-xl font-bold">Messages</h2>
            </div>
            {/* Search bar at top of aside (mobile only) */}
            <div className="px-4 py-2 border-b border-[#23272f] bg-[#16181C]" style={{display:'flex',alignItems:'center',gap:8}}>
              <div style={{position:'relative',width:'100%'}}>
                <input
                  type="text"
                  placeholder="Search users..."
                  className="w-full px-4 py-2 pr-10 bg-[#202327] text-white border border-transparent focus:border-[#1d9bf0] rounded-full outline-none transition-colors text-sm"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  style={{minWidth:0}}
                />
                <button
                  type="button"
                  onClick={handleSearch}
                  style={{
                    position:'absolute',
                    right:10,
                    top:'50%',
                    transform:'translateY(-50%)',
                    background:'none',
                    border:'none',
                    padding:0,
                    cursor:'pointer',
                    height: '32px',
                    width: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  tabIndex={0}
                  aria-label="Search"
                >
                  <span className="material-symbols-outlined" style={{fontSize:22,color:'#1d9bf0',display:'flex',alignItems:'center',justifyContent:'center',height:'100%'}}>search</span>
                </button>
              </div>
            </div>
            <ul>
              {(() => {
                let usersToShow = [];
                if (searchTerm.trim()) {
                  usersToShow = sortedUsers.filter(user =>
                    user.username.toLowerCase().includes(searchTerm.toLowerCase())
                  );
                } else {
                  // Sort by most recent message date (like desktop), then unread count
                  usersToShow = sortedUsers
                    .filter(user => !isChatEmpty(user._id))
                    .map(user => {
                      const relevantMessages = allMessages.filter(m =>
                        (m.sender === user._id || m.receiver === user._id) &&
                        (!m.deletedFor || !m.deletedFor.includes(currentUserId))
                      );
                      let lastMsgDate = 0;
                      if (relevantMessages.length > 0) {
                        lastMsgDate = Math.max(...relevantMessages.map(m => new Date(m.createdAt).getTime()));
                      }
                      return { ...user, _lastMsgDate: lastMsgDate };
                    })
                    .sort((a, b) => {
                      if (b._lastMsgDate !== a._lastMsgDate) return b._lastMsgDate - a._lastMsgDate;
                      const unreadA = unreadCounts[a._id] || 0;
                      const unreadB = unreadCounts[b._id] || 0;
                      if (unreadA !== unreadB) return unreadB - unreadA;
                      return 0;
                    });
                }
                if (!usersToShow.length) {
                  return (
                    <li className="text-gray-400 px-4 py-3">No users to show.</li>
                  );
                }
                return usersToShow.map(user => {
                  const unread = unreadCounts[user._id] || 0;
                  return (
                    <li key={user._id + '-' + unread}>
                      <button
                        className={`w-full text-left px-4 py-3 flex items-center hover:bg-[#202327] transition ${selectedId === user._id ? 'bg-[#23272f]' : ''}`}
                        onClick={() => setSelectedId(user._id)}
                      >
                        {user.profilePhoto && user.profilePhoto.url ? (
                          <img
                            src={user.profilePhoto.url}
                            alt={user.username}
                            className="w-10 h-10 rounded-full object-cover mr-3 border border-gray-700"
                          />
                        ) : (
                          <span className="material-symbols-outlined mr-3">person</span>
                        )}
                        <div className="relative flex flex-col">
                          <div className="font-semibold flex items-center gap-1" style={{display:'flex',flexDirection:'row',alignItems:'center'}}>
                            <span style={{display:'flex',alignItems:'center'}}>
                              {user.username}
                              {user.IsVerified && (
                                <span title="Verified" className="inline-block align-middle">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    x="0px"
                                    y="0px"
                                    width="20"
                                    height="20"
                                    viewBox="0 0 50 50"
                                    className="inline-block align-middle ml-1"
                                    style={{ verticalAlign: "middle" }}
                                  >
                                    <path
                                      fill="#1DA1F2"
                                      d="M45.103,24.995l3.195-6.245l-5.892-3.807l-0.354-7.006l-7.006-0.35l-3.81-5.89l-6.242,3.2l-6.245-3.196l-3.806,5.893 L7.938,7.948l-0.352,7.007l-5.89,3.81l3.2,6.242L1.702,31.25l5.892,3.807l0.354,7.006l7.006,0.35l3.81,5.891l6.242-3.2l6.245,3.195 l3.806-5.893l7.005-0.354l0.352-7.006l5.89-3.81L45.103,24.995z M22.24,32.562l-6.82-6.819l2.121-2.121l4.732,4.731l10.202-9.888 l2.088,2.154L22.24,32.562z"
                                    ></path>
                                  </svg>
                                </span>
                              )}
                            </span>
                            {/* Show unread badge for both desktop and mobile (copied from desktop) */}
                            {unread > 0 && (
                              <span className="ml-2 flex items-center" style={{alignSelf:'center'}}>
                                <span
                                  className="unread-badge"
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: '#fff',
                                    color: '#1d9bf0',
                                    fontWeight: 700,
                                    fontSize: 13,
                                    borderRadius: '9999px',
                                    minWidth: 22,
                                    minHeight: 22,
                                    padding: '0 6px 0 6px',
                                    border: '2px solid #1d9bf0',
                                    marginLeft: 6,
                                    marginBottom: isMobile ? 0 : '6px',
                                  }}
                                >
                                  {unread}
                                </span>
                              </span>
                            )}
                          </div>
                          <div className="text-gray-400 text-sm truncate max-w-xs">{user.email}</div>
                        </div>
                      </button>
                    </li>
                  );
                });
              })()}
            </ul>
          </aside>
  );
}

export default MessagesMobile;
