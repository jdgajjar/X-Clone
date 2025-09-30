import React from "react";
import DeleteMessageModal from "./DeleteMessageModal";
import MessageDropdownIcon from "./MessageDropdownIcon";
import DropdownMenu from "./DropdownMenu";
import { socket } from "../utils/socket";
import { markMessagesRead, fetchMessageCounts } from '../utils/api';
import { clientServer } from '../config/clientServer';
import MessagesMobile from "./MessagesMobile";
import MessagesDesktop from "./MessagesDesktop";
// Helper to count unread messages for a user



const Messages = () => {
  // State for editing message
  const [editingMsgIdx, setEditingMsgIdx] = React.useState(null);
  const [editingMsgContent, setEditingMsgContent] = React.useState("");

  // Search state for desktop sidebar
  const [searchTerm, setSearchTerm] = React.useState("");
  // Optionally, filter users based on searchTerm
  const handleSearch = () => {
 
  };
  // Real-time: listen for messageDeleted event ONCE per mount
  React.useEffect(() => {
    const handler = ({ messageId }) => {
      setMessages(prev => prev.filter(m => m._id !== messageId));
      setAllMessages(prev => prev.filter(m => m._id !== messageId));
    };
    socket.on('messageDeleted', handler);
    return () => {
      socket.off('messageDeleted', handler);
    };
  }, []);

  // Real-time: listen for messageEdited event
  React.useEffect(() => {
    const handler = (editedMsg) => {
      setMessages(prev => prev.map(m => m._id === editedMsg._id ? { ...m, content: editedMsg.content } : m));
      setAllMessages(prev => prev.map(m => m._id === editedMsg._id ? { ...m, content: editedMsg.content } : m));
    };
    socket.on('messageEdited', handler);
    return () => {
      socket.off('messageEdited', handler);
    };
  }, []);
  // Mobile detection
  const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 768);
  // State for delete modal (must be inside component)
  const [deleteModal, setDeleteModal] = React.useState({ open: false, msgIdx: null });
  // State for 3-dot header menu (mobile)
  const [showHeaderMenuMobile, setShowHeaderMenuMobile] = React.useState(false);
    // Track current userId (assume backend sets req.user._id in session)
  const [currentUserId, setCurrentUserId] = React.useState(null);
  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [users, setUsers] = React.useState([]);
  const [selectedId, setSelectedId] = React.useState(null);
  // Removed unreadCounts state

  // Unread counts per user
  const [unreadCounts, setUnreadCounts] = React.useState({});
  // Fetch users and unread counts on mount
  React.useEffect(() => {
    let ignore = false;
    clientServer.get("/api/users")
      .then((res) => {
        const data = res.data;
        if (ignore) return;
        // Patch: add blockedUsers/blockedBy to user objects if missing (for UI-side check)
        const usersWithBlock = Array.isArray(data.users) ? data.users.map(u => ({
          ...u,
          blockedUsers: u.blockedUsers || [],
          blockedBy: u.blockedBy || [],
        })) : [];
        setUsers(usersWithBlock);
        // Restore last selected user from localStorage, or default to first user
        const lastSelectedId = localStorage.getItem("lastSelectedUserId");
        if (Array.isArray(data.users) && data.users.length > 0) {
          if (lastSelectedId && data.users.some(u => u._id === lastSelectedId)) {
            setSelectedId(lastSelectedId);
          } else {
            setSelectedId(data.users[0]._id);
          }
        }
      });
    // Fetch unread counts per user
    clientServer.get('/api/messages/unread-counts')
      .then(res => {
        const data = res.data;
        if (ignore) return;
        if (data && data.counts) {
          setUnreadCounts(data.counts);
          // Removed console.log for unread message counts
        }
      }).catch(() => {});
    return () => { ignore = true; };
  }, []);

  const [messages, setMessages] = React.useState([]);
  const [newMessage, setNewMessage] = React.useState("");
  const [sending, setSending] = React.useState(false);

  // State for active message index (for click/tap to show arrow)
  const [activeMsgIdx, setActiveMsgIdx] = React.useState(null);
  // State to track which dropdown is open (must be at top level, not in map)
  const [openDropdownIdx, setOpenDropdownIdx] = React.useState(null);

  // Hide arrow and dropdown only when clicking outside the message row (the flex row for this message)
  React.useEffect(() => {
    if (activeMsgIdx === null) return;
    function handleClick(e) {
      // Only close if click is outside the currently active message row
      const row = document.querySelectorAll('.msg-row')[activeMsgIdx];
      if (!row) return;
      if (!row.contains(e.target)) setActiveMsgIdx(null);
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('touchstart', handleClick);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('touchstart', handleClick);
    };
  }, [activeMsgIdx]);

  // Track last message time per user using allMessages
  const [allMessages, setAllMessages] = React.useState([]);
  const [lastMessageTimes, setLastMessageTimes] = React.useState({});

  // Fetch all messages for all users on mount and when users change (frontend workaround)
  React.useEffect(() => {
    if (!currentUserId || !users.length) return;
    let ignore = false;
    const fetchAll = async () => {
      let all = [];
      for (const user of users) {
        try {
          const res = await clientServer.get(`/api/messages/${user._id}`);
          const data = res.data;
          if (Array.isArray(data.messages)) {
            all = all.concat(data.messages);
          }
        } catch (e) {}
        if (ignore) return;
      }
      setAllMessages(all);
    };
    fetchAll();
    return () => { ignore = true; };
  }, [currentUserId, users]);

  // Update lastMessageTimes when users or allMessages change
  React.useEffect(() => {
    if (!currentUserId || !users.length) return;
    const times = {};
    users.forEach((user) => {
      // Find all messages for this user
      const userMessages = allMessages.filter(
        (msg) =>
          (msg.sender === user._id && msg.receiver === currentUserId) ||
          (msg.receiver === user._id && msg.sender === currentUserId)
      );
      if (userMessages.length > 0) {
        // Get the latest message date
        const lastMsg = userMessages.reduce((a, b) =>
          new Date(a.createdAt) > new Date(b.createdAt) ? a : b
        );
        times[user._id] = new Date(lastMsg.createdAt).getTime();
      } else {
        times[user._id] = 0;
      }
    });
    setLastMessageTimes(times);
  }, [users, currentUserId, allMessages]);

  // Persist sorted user order in state so it doesn't reset on chat change
  const [sortedUsers, setSortedUsers] = React.useState([]);
  const lastSortedUsersRef = React.useRef([]);
  // Fix: Declare prevLastMessageTimesRef only once here
  const prevLastMessageTimesRef = React.useRef({});

  // Only update sortedUsers when users or lastMessageTimes change due to new messages, not when switching chats
  // Save sorted order in a variable, and only update when new messages arrive or are sent
  // (declaration moved below, only declare once)
  // Only update sortedUsers when users or lastMessageTimes change due to new messages, not when switching chats
  // Save sorted order in a variable, and only update when new messages arrive or are sent
  const prevUsersRef = React.useRef([]);
  // Only update sortedUsers when users or lastMessageTimes change due to new messages, not when switching chats
  // Save sorted order in a variable, and only update when new messages arrive or are sent
  // Declare prevLastMessageTimesRef only once above
  // --- Fix: Always sort by the latest message between current user and each user, using all messages ---
  React.useEffect(() => {
    if (!users.length) {
      setSortedUsers(users);
      lastSortedUsersRef.current = users;
      return;
    }
    // For each user, use lastMessageTimes to sort
    const sorted = [...users].sort((a, b) => {
      const tA = lastMessageTimes[a._id] || 0;
      const tB = lastMessageTimes[b._id] || 0;
      return tB - tA;
    });
    setSortedUsers(sorted);
    lastSortedUsersRef.current = sorted;
  }, [users, lastMessageTimes, currentUserId]);
  // Derive selectedUser from users and selectedId
  const selectedUser = users.find((u) => u._id === selectedId) || null;


  // Ref for chat container to auto-scroll to bottom
  const chatContainerRef = React.useRef(null);
  // State to show/hide scroll-to-bottom button
  const [showScrollToBottom, setShowScrollToBottom] = React.useState(false);

  // Handler for scroll event
  const handleChatScroll = () => {
    const el = chatContainerRef.current;
    if (!el) return;
    // Show button if not at bottom (allow 40px leeway)
    setShowScrollToBottom(el.scrollHeight - el.scrollTop - el.clientHeight > 40);
  };

  // Scroll to bottom function
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  // Persist selectedId to localStorage
  React.useEffect(() => {
    if (selectedId) {
      localStorage.setItem("lastSelectedUserId", selectedId);
    }
  }, [selectedId]);



  // Fetch current userId on mount (from /api/users/me or similar, fallback to first user for demo)
  React.useEffect(() => {
    let ignore = false;
    clientServer.get("/api/users/me")
      .then(res => {
        const data = res.data;
        if (ignore) return;
        if (data && data.user && data.user._id) setCurrentUserId(data.user._id);
        else if (users.length > 0) setCurrentUserId(users[0]._id);
      });
    return () => { ignore = true; };
  }, [users.length]);

  // Real-time: connect to socket.io and join room
  React.useEffect(() => {
    if (!currentUserId) return;
    socket.connect();
    socket.emit("join", currentUserId);
    return () => {
      socket.disconnect();
    };
  }, [currentUserId]);

  // Fetch all messages for all users on mount and when users change
  React.useEffect(() => {
    if (!currentUserId || !users.length) return;
    let ignore = false;
    // Remove the fetch to /api/messages/all entirely to stop the request and error
    return () => { ignore = true; };
  }, [currentUserId, users]);

  // Fetch messages for selected user only for chat view and mark as read
  // Only update the sortedUsers order when new messages arrive or are sent, not when switching chats
  React.useEffect(() => {
    if (!selectedUser || !currentUserId) return;
    let ignore = false;
    clientServer.get(`/api/messages/${selectedUser._id}`)
      .then(res => {
        const data = res.data;
        if (!ignore) {
          // Always sort messages by date ascending, even if already sorted
          const chatMsgs = Array.isArray(data.messages) ? data.messages : [];
          const sortedMsgs = [...chatMsgs].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
          setMessages(sortedMsgs);
        }
        // Mark messages as read when opening chat
        markMessagesRead(selectedUser._id).catch(() => {});
      });
    return () => { ignore = true; };
    // eslint-disable-next-line
  }, [selectedUser?._id, currentUserId]);

 


  // Listen for new messages and read/unread events in real time
  React.useEffect(() => {
    if (!selectedUser || !currentUserId) return;
    // Always update unread counts for all users on any new message
    const handler = (msg) => {
      // Add to allMessages for real-time sorting
      setAllMessages((prev) => {
        if (prev.some(m => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
      const isForThisChat =
        (msg.sender === selectedUser?._id && msg.receiver === currentUserId) ||
        (msg.sender === currentUserId && msg.receiver === selectedUser?._id);
      // If this chat is open and the message is for me, mark as read immediately (desktop or mobile)
      if (isForThisChat && msg.receiver === currentUserId && selectedUser) {
        // On mobile, also check if chat is open (selectedUser is set)
        markMessagesRead(selectedUser._id).catch(() => {});
      }
      // Always update unread counts for all users
      clientServer.get('/api/messages/unread-counts')
        .then(res => {
          const data = res.data;
          if (data && data.counts) setUnreadCounts(data.counts);
        });
      // Only update messages if this chat is open
      if (isForThisChat) {
        clientServer.get(`/api/messages/${selectedUser._id}`)
          .then(res => {
            const data = res.data;
            // Always sort messages by date ascending
            setMessages(Array.isArray(data.messages)
              ? data.messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
              : []
            );
          });
      }
    };
    // When a message is read, update unread counts in real time
    const readHandler = (data) => {
      // Update unread counts for all users
      clientServer.get('/api/messages/unread-counts')
        .then(res => {
          if (res.data && res.data.counts) setUnreadCounts(res.data.counts);
        })
        .catch(err => console.error('Error fetching unread counts:', err));
    };
    socket.on("newMessage", handler);
    socket.on("messageRead", readHandler);
    return () => {
      socket.off("newMessage", handler);
      socket.off("messageRead", readHandler);
    };
  }, [selectedUser?._id, currentUserId]);

  // Auto-scroll to bottom when messages change or chat is opened
  React.useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, selectedUser?._id, isMobile]);

  // Attach/detach scroll event listener
  React.useEffect(() => {
    const el = chatContainerRef.current;
    if (!el) return;
    el.addEventListener('scroll', handleChatScroll);
    // Check on mount
    handleChatScroll();
    return () => {
      el.removeEventListener('scroll', handleChatScroll);
    };
    // eslint-disable-next-line
  }, [selectedUser?._id, isMobile]);

  // Send message handler
  const handleSend = async (e) => {
    e.preventDefault();
    if (!selectedUser || !newMessage.trim()) return;
    setSending(true);
    try {
      // UI-side check: block sending if either user has blocked the other
      if (selectedUser.blockedUsers && selectedUser.blockedUsers.includes(currentUserId)) {
        alert('You have blocked this user. Unblock to send messages.');
        setSending(false);
        return;
      }
      if (selectedUser.blockedBy && selectedUser.blockedBy.includes(currentUserId)) {
        alert('You cannot message this user.');
        setSending(false);
        return;
      }
      let res;
      try {
        res = await clientServer.post("/api/messages", { receiver: selectedUser._id, content: newMessage });
      } catch (err) {
        if (err.response && err.response.status === 403) {
          const data = err.response.data;
          alert(data.error || 'You cannot message this user.');
          setSending(false);
          return;
        }
        setSending(false);
        return;
      }
      if (res && res.data && res.data.message) {
        setNewMessage("");
        const data = res.data;
        setMessages((prev) => [...prev, data.message]);
        setAllMessages((prev) => {
          if (prev.some(m => m._id === data.message._id)) return prev;
          return [...prev, data.message];
        });
        // Emit to socket for real-time delivery
        socket.emit("sendMessage", { message: data.message, receiverId: selectedUser._id });
      }
    } finally {
      setSending(false);
    }
  };

  // Track users that have been messaged (always show in sidebar if chat is not empty)
  const [messagedUsers, setMessagedUsers] = React.useState([]);
  // Find user by id utility (from sortedUsers)
  const getUserById = (id) => sortedUsers.find(u => u._id === id);
  // Check if chat with user is empty
  const isChatEmpty = (userId) => {
    // messages is for current selected user, allMessages is for all users
    // Find any message for this user (not deleted for me)
    return !allMessages.some(
      m => ((m.sender === userId || m.receiver === userId) && (!m.deletedFor || !m.deletedFor.includes(currentUserId)))
    );
  };

  return (
    <>
      {/* Delete Message Modal (always rendered at top level, hidden unless open) */}
      <DeleteMessageModal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, msgIdx: null, msgId: null })}
        onDeleteForMe={async () => {
          const msgId = deleteModal.msgId;
          if (!msgId) {
            setDeleteModal({ open: false, msgIdx: null, msgId: null });
            return;
          }
          try {
          const res = await clientServer.post('/api/messages/delete-for-me', { messageId: msgId });
          if (res && res.status === 200) {
            setMessages(prev => prev.filter(m => m._id !== msgId));
            setAllMessages(prev => prev.filter(m => m._id !== msgId));
          }
          } catch (e) {}
          setDeleteModal({ open: false, msgIdx: null, msgId: null });
        }}
        onDeleteForEveryone={async () => {
          const msgId = deleteModal.msgId;
          if (!msgId) {
            setDeleteModal({ open: false, msgIdx: null, msgId: null });
            return;
          }
          try {
          const res = await clientServer.post('/api/messages/delete-for-everyone', { messageId: msgId });
          if (res && res.status === 200) {
            setMessages(prev => prev.filter(m => m._id !== msgId));
            setAllMessages(prev => prev.filter(m => m._id !== msgId));
          }
          } catch (e) {}
          setDeleteModal({ open: false, msgIdx: null, msgId: null });
        }}
        message={messages[deleteModal.msgIdx]}
      />
      <div className="bg-black text-white flex" style={{overflow: 'hidden', height: '100vh'}}>
      {/* Mobile: show only list or only chat */}
      {isMobile ? 
<MessagesMobile 
  
  selectedUser={selectedUser}
  setSelectedId={setSelectedId}
  showHeaderMenuMobile={showHeaderMenuMobile}
  setShowHeaderMenuMobile={setShowHeaderMenuMobile}
  currentUserId={currentUserId}
  setMessages={setMessages}
  setUsers={setUsers}
  setSortedUsers={setSortedUsers}
  selectedId={selectedId}
  messages={messages}
  setActiveMsgIdx={setActiveMsgIdx}
  activeMsgIdx={activeMsgIdx}
  openDropdownIdx={openDropdownIdx}
  setOpenDropdownIdx={setOpenDropdownIdx}
  editingMsgIdx={editingMsgIdx}
  setEditingMsgIdx={setEditingMsgIdx}
  editingMsgContent={editingMsgContent}
  setEditingMsgContent={setEditingMsgContent}
  setDeleteModal={setDeleteModal}
  setAllMessages={setAllMessages}
  allMessages={allMessages}
  isMobile={isMobile}
  chatContainerRef={chatContainerRef}
  showScrollToBottom={showScrollToBottom}
  scrollToBottom={scrollToBottom}
  newMessage={newMessage}
  setNewMessage={setNewMessage}
  sending={sending}
  setMessagedUsers={setMessagedUsers}
  handleSend={handleSend}
  searchTerm={searchTerm}
  setSearchTerm={setSearchTerm}
  handleSearch={handleSearch}
  sortedUsers={sortedUsers}
  unreadCounts={unreadCounts}
  isChatEmpty={isChatEmpty}
/>
      : (
        // Desktop: show both sidebar and chat
       <MessagesDesktop
           selectedUser={selectedUser}
  setSelectedId={setSelectedId}
  showHeaderMenuMobile={showHeaderMenuMobile}
  setShowHeaderMenuMobile={setShowHeaderMenuMobile}
  currentUserId={currentUserId}
  setMessages={setMessages}
  setUsers={setUsers}
  setSortedUsers={setSortedUsers}
  selectedId={selectedId}
  messages={messages}
  setActiveMsgIdx={setActiveMsgIdx}
  activeMsgIdx={activeMsgIdx}
  openDropdownIdx={openDropdownIdx}
  setOpenDropdownIdx={setOpenDropdownIdx}
  editingMsgIdx={editingMsgIdx}
  setEditingMsgIdx={setEditingMsgIdx}
  editingMsgContent={editingMsgContent}
  setEditingMsgContent={setEditingMsgContent}
  setDeleteModal={setDeleteModal}
  setAllMessages={setAllMessages}
  allMessages={allMessages}
  isMobile={isMobile}
  chatContainerRef={chatContainerRef}
  showScrollToBottom={showScrollToBottom}
  scrollToBottom={scrollToBottom}
  newMessage={newMessage}
  setNewMessage={setNewMessage}
  sending={sending}
  handleSend={handleSend}
  searchTerm={searchTerm}
  setSearchTerm={setSearchTerm}
  handleSearch={handleSearch}
  sortedUsers={sortedUsers}
  unreadCounts={unreadCounts}
  isChatEmpty={isChatEmpty}
  />
      )}
    </div>
    </>
  );
};

export default Messages;
