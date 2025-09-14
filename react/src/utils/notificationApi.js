import { clientServer } from "../config/clientServer";

// Get all notifications
export async function fetchNotifications() {
  try {
    const response = await clientServer.get("/api/notifications");
    return response.data;
  } catch (error) {
    console.error("Error fetching notifications:", error?.response?.data || error.message);
    throw new Error("Failed to fetch notifications");
  }
}

// Mark all as read
export async function markAllNotificationsRead() {
  try {
    const response = await clientServer.post("/api/notifications/mark-all-read");
    return response.data;
  } catch (error) {
    console.error("Error marking notifications as read:", error?.response?.data || error.message);
    throw new Error("Failed to mark notifications as read");
  }
}
