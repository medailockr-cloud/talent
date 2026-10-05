import { Expo } from 'expo-server-sdk';

const expo = new Expo();

export const sendPushNotification = async (pushToken: string, message: string, data = {}) => {
  if (!Expo.isExpoPushToken(pushToken)) {
    console.error(`Push token ${pushToken} is not a valid Expo push token`);
    return;
  }

  const messages = [{
    to: pushToken,
    sound: 'default' as const,
    body: message,
    data: data,
  }];

  try {
    const ticketChunk = await expo.sendPushNotificationsAsync(messages);
    console.log('Push notification sent successfully:', ticketChunk);
  } catch (error) {
    console.error('Error sending push notification:', error);
  }
};
