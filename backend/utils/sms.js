const sendSMS = async (phoneNumber, message) => {
  // In a real application, you would integrate Twilio, AWS SNS, or another SMS gateway here.
  // For now, we simulate sending an SMS by logging it to the console.
  console.log(`\n[Mock SMS] Sending to ${phoneNumber || 'Unknown Number'}`);
  console.log(`[Mock SMS] Message: ${message}\n`);
  
  // Return true to indicate successful "sending"
  return true;
};

module.exports = {
  sendSMS,
};
