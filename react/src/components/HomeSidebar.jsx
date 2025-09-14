import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { getUnreadCount, markNotificationsAsRead  } from '../config/redux/action/NotificationAction';
import { socket } from '../utils/socket';

const HomeSidebar = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const unreadCount = useSelector((state) => state.notification?.count || 0);
  const isOnNotificationPage = location.pathname === '/notifications';

  console.log("🔢 Rendered unreadCount:", unreadCount);

  useEffect(() => {
    console.log("📦 Initial unread count request dispatched");
    dispatch(getUnreadCount());

    if (!socket.connected) {
      socket.connect();
      console.log("🔌 Socket connected");
    }

   const updateUnread = () => {
  if (location.pathname === '/notifications') {
    dispatch(markNotificationsAsRead());
  } else {
    dispatch(getUnreadCount());
  }
};

    socket.on('notification', updateUnread);
    socket.on('notificationReceived', updateUnread);
    socket.on('notificationsRead', updateUnread);

    const interval = setInterval(updateUnread, 5000);

    return () => {
      console.log("🧹 Cleanup socket listeners and polling");
      socket.off('notification', updateUnread);
      socket.off('notificationReceived', updateUnread);
      socket.off('notificationsRead', updateUnread);
      clearInterval(interval);
    };
  }, [dispatch]);

const goTo = (url) => {
  navigate(url);
  if (url === '/notifications') {
    dispatch(markNotificationsAsRead())  // ✅ Mark read
      .then(() => dispatch(getUnreadCount())); // ✅ Then update count to 0
  }
};

  return (
    <header className="md:w-[275px] lg:w-[300px] xl:w-[340px] w-fit z-0">
      <div className="fixed bottom-0 md:h-screen py-0 md:py-2 w-fit z-0">
        <div className="flex md:flex-col h-16 md:h-full overflow-y-auto">
          <nav className="fixed bottom-0 left-0 right-0 border-t border-gray-800 bg-black md:border-0 md:relative md:bg-transparent md:mt-[55px] z-0">
            <ul className="flex justify-around md:justify-start md:flex-col md:space-y-1 px-0 md:px-2 py-2 md:py-0">
              <li className="md:w-fit">
                <button onClick={() => goTo('/')} className="nav-item flex items-center justify-center md:justify-start p-3 rounded-full transition-colors group">
                  <span className="material-symbols-outlined text-[26px] md:mr-4">home</span>
                  <span className="hidden md:block text-xl">Home</span>
                </button>
              </li>

       <li className="md:w-fit relative">
  <button
    onClick={() => goTo('/notifications')}
    className="nav-item flex items-center space-x-4 text-gray-300 p-3 rounded-full transition-colors relative"
  >
    <span className="material-symbols-outlined relative">
      notifications

      {!isOnNotificationPage && unreadCount > 0 && (
        <span
          style={{
            position: 'absolute',
            top: -6,
            right: -10,
            backgroundColor: '#1d9bf0',
            color: 'white',
            fontSize: '12px',
            fontWeight: 600,
            borderRadius: '9999px',
            padding: '2px 6px',
            minWidth: '20px',
            textAlign: 'center',
            boxShadow: '0 0 2px #1d9bf0',
          }}
        >
          {unreadCount}
        </span>
      )}
    </span>

    <span className="hidden md:block text-xl">Notifications</span>
  </button>
</li>


              <li className="md:w-fit">
                <button onClick={() => goTo('/messages')} className="nav-item flex items-center justify-center md:justify-start p-3 rounded-full transition-colors group">
                  <span className="material-symbols-outlined text-[26px] md:mr-4">message</span>
                  <span className="hidden md:block text-xl">Messages</span>
                </button>
              </li>

              <li className="hidden md:block md:w-fit">
                <button onClick={() => goTo('/bookmarks')} className="nav-item flex items-center justify-center md:justify-start p-3 rounded-full transition-colors group w-full text-left">
                  <span className="material-symbols-outlined text-[26px] md:mr-4">bookmarks</span>
                  <span className="hidden md:block text-xl">Bookmarks</span>
                </button>
              </li>

              {!user?.IsVerified && (
                <li className="hidden md:block md:w-fit">
                  <button onClick={() => goTo('/premium')} className="nav-item flex items-center justify-center md:justify-start p-3 rounded-full transition-colors group w-full text-left">
                    <span className="material-symbols-outlined text-[26px] md:mr-4">box</span>
                    <span className="hidden md:block text-xl">Premium</span>
                  </button>
                </li>
              )}

              <li className="md:w-fit">
                <button onClick={() => goTo(`/profile/${user?.username || ''}`)} className="nav-item flex items-center justify-center md:justify-start p-3 rounded-full transition-colors group">
                  <span className="material-symbols-outlined text-[26px] md:mr-4">person</span>
                  <span className="hidden md:block text-xl">Profile</span>
                </button>
              </li>

              <li className="md:w-fit">
                <button onClick={() => goTo(`/${user?._id || ''}/settings`)} className="nav-item flex items-center justify-center md:justify-start p-3 rounded-full transition-colors group">
                  <span className="material-symbols-outlined text-[26px] md:mr-4">settings</span>
                  <span className="hidden md:block text-xl">More</span>
                </button>
              </li>
            </ul>
          </nav>

          <div className="fixed right-4 bottom-20 md:static md:mt-4 md:mr-auto ml-5 z-10">
            <button onClick={() => goTo('/post/new')} className="bg-[#1d9bf0] hover:bg-[#1A8CD8] text-white rounded-full p-3 md:py-3 md:px-8 shadow-lg transition-colors w-14 h-14 md:w-auto md:h-auto flex items-center justify-center">
              <span className="material-symbols-outlined md:hidden">edit</span>
              <span className="hidden md:inline font-bold text-lg">Post</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default HomeSidebar;
