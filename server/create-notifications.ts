import {memStorage, storage} from './storage';
import { NOTIFICATION_TYPE } from '../shared/schema';

/**
 * This script creates sample notifications for testing
 */
export async function createNotifications() {
  // Create notifications for admin user (userId = 2)
  const userId = 2;
  
  // Clear any existing notifications first
  const currentNotifications = await memStorage.getUserNotifications(userId);
  for (const notification of currentNotifications) {
    await memStorage.deleteNotification(notification.id);
  }

  // Create notifications for different scenarios
  await memStorage.createNotification({
    userId,
    type: NOTIFICATION_TYPE.NEW_FOLLOWER,
    title: "New Follower",
    message: "Demo User started following you",
    relatedUserId: 1, // Demo user
  });

  await memStorage.createNotification({
    userId,
    type: NOTIFICATION_TYPE.EVENT_STARTING_TODAY,
    title: "Event Starting Today",
    message: "Your event 'Digital Skills Workshop' is starting today!",
    eventId: 4, // Digital Skills Workshop
  });

  await memStorage.createNotification({
    userId,
    type: NOTIFICATION_TYPE.NEW_COMMENT,
    title: "New Comment",
    message: "Demo User commented on your event 'Culinary Masterclass'",
    eventId: 6, // Culinary Masterclass
    relatedUserId: 1, // Demo user
  });

  await memStorage.createNotification({
    userId,
    type: NOTIFICATION_TYPE.ATTENDANCE_UPDATE,
    title: "New Attendee",
    message: "Demo User is attending your event 'Tech Innovation Summit 2025'",
    eventId: 1, // Tech Innovation Summit
    relatedUserId: 1, // Demo user
  });

  await memStorage.createNotification({
    userId,
    type: NOTIFICATION_TYPE.ADMIN_MESSAGE,
    title: "Platform Update",
    message: "Welcome to the new notification system! Check out the notification bell in the top navigation.",
  });

  console.log('Created sample notifications for admin user');
}