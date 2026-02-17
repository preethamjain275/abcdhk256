// Basic Notification Service
// In a real app, this could use Nodemailer, Twilio, or Firebase Cloud Messaging.
// For now, we'll log it and simulate a backend trigger.

export const sendNotification = async (userId, title, message) => {
  console.log(`[Notification] To User ${userId}: ${title} - ${message}`);
  // In a real world scenario, you would call a free service API like OneSignal or use Nodemailer
  return true;
};
