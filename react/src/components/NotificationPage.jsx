import React, { useEffect, useState } from "react";
import { fetchNotifications, markAllNotificationsRead } from "../utils/notificationApi";
import { socket } from "../utils/socket";
import HomeSidebar from "./HomeSidebar";
import HomeRightSidebar from "./HomeRightSidebar";
import HomeHead from "./HomeHead";

const NotificationPage = ({ user, randomusers = [] }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    // Mark all notifications as read when visiting page
    markAllNotificationsRead().then(() => {
      socket.emit('notificationsRead');
      fetchNotifications()
        .then((data) => setNotifications(data))
        .catch(() => setNotifications([]))
        .finally(() => setLoading(false));
    });

    // Real-time notification updates
    socket.connect();
    socket.on("notification", () => {
      fetchNotifications()
        .then((data) => {
          setNotifications(data);
          // Emit event for unread dot update in HomeSidebar
          socket.emit('notificationReceived');
        })
        .catch(() => setNotifications([]));
    });

    // Listen for notificationsRead event to update notifications if needed
    socket.on("notificationsRead", () => {
      fetchNotifications()
        .then((data) => setNotifications(data))
        .catch(() => setNotifications([]));
    });

    // Poll for notifications every 5 seconds
    const interval = setInterval(() => {
      fetchNotifications()
        .then((data) => setNotifications(data))
        .catch(() => setNotifications([]));
    }, 5000);

    return () => {
      socket.off("notification");
      socket.off("notificationsRead");
      socket.disconnect();
      clearInterval(interval);
    };
  }, []);

  return (
    <div
      className="antialiased bg-black text-white font-sans min-h-screen"
      data-current-user-name={user?.username || ""}
    >
      <div className="fixed top-0 left-0 w-full bg-black z-50">
        <HomeHead />
      </div>
      <div className="flex min-h-screen mt-[55px] max-w-7xl mx-auto">
        {/* Sidebar - Left */}
        <aside className="md:w-[275px] lg:w-[300px] xl:w-[340px] w-fit z-0">
          <div className="fixed bottom-0 md:h-screen py-0 md:py-2 w-fit z-0">
            <div className="flex md:flex-col h-16 md:h-full overflow-y-auto">
              <HomeSidebar user={user} />
            </div>
          </div>
        </aside>
        {/* Main Content */}
        <main className="flex-grow border-x border-gray-800 min-h-screen md:max-w-[600px]">
          <header className="sticky top-0 bg-black/80 backdrop-blur z-10 border-b border-gray-800 px-4 py-3 flex items-center">
            <h2 className="text-xl font-bold">Notifications</h2>
          </header>
          {loading ? (
            <div className="text-center text-gray-500 py-8">Loading...</div>
          ) : notifications.length === 0 ? (
            <div className="text-center text-gray-500 py-8">No notifications yet</div>
          ) : (
            <>
              <ul className="divide-y divide-gray-800">
                {notifications.map((notif) => {
                  let link = '#';
                  if (notif.type === 'follow' && notif.fromUser?.username) {
                    link = `/profile/${notif.fromUser.username}/following`;
                  } else if (notif.type === 'comment' && notif.post?._id && notif._id) {
                    // Link to post and add anchor for comment notification
                    link = `/post/${notif.post._id}#comment-${notif._id}`;
                  } else if (notif.type === 'post' && (notif.post?._id || notif.post)) {
                    // Use post._id if available, else post (for legacy)
                    link = `/post/${notif.post._id || notif.post}`;
                  }
                  return (
                    <li
                      key={notif._id}
                      className={`flex items-start gap-4 px-4 py-5 hover:bg-gray-900 transition-colors cursor-pointer ${notif.read ? '' : 'bg-gray-950'}`}
                      style={{ minHeight: '80px', alignItems: 'center' }}
                    >
                      <a href={link} style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit', width: '100%' }}>
                        <div style={{ width: 56, height: 56, minWidth: 56, minHeight: 56, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {(() => {
                            const imgUrl =
                              notif.fromUser && notif.fromUser.profilePhoto && notif.fromUser.profilePhoto.url && notif.fromUser.profilePhoto.url !== ''
                                ? notif.fromUser.profilePhoto.url
                                : (notif.fromUser && notif.fromUser.avatar && notif.fromUser.avatar !== '')
                                  ? notif.fromUser.avatar
                                  : 'https://res.cloudinary.com/dkqd9ects/image/upload/v1747571510/profile_offakc.png';
                            return (
                              <img
                                src={imgUrl}
                                alt={notif.fromUser?.username}
                                style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }}
                              />
                            );
                          })()}
                        </div>
                        <div style={{ flex: 1 }}>
                          <span>{notif.message} by </span>
                          <span className="font-semibold mr-1">{notif.fromUser?.username}</span>
                          <div className="text-xs text-gray-400 mt-1">
                            {new Date(notif.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </a>
                    </li>
                  );
                })}
              </ul>
              <div className="text-center text-gray-500 py-8">
                You're all caught up
              </div>
            </>
          )}
        </main>
        {/* Right Sidebar (only visible on large screens) */}
        <aside className="right-sidebar hidden-desktop lg:block lg:w-[350px] xl:w-[390px] border-l border-gray-700">
          <HomeRightSidebar user={user} randomusers={randomusers} />
        </aside>
      </div>
    </div>
  );
};

export default NotificationPage;
