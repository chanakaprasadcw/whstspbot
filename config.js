// Configuration file for WhatsApp Bot

module.exports = {
  // Auto-reply settings
  autoReply: {
    enabled: true,

    // Keywords and their responses
    // The bot will reply when it receives messages containing these keywords
    keywords: {
      'hello': 'Hi! Thanks for your message. How can I help you?',
      'hi': 'Hello! Thanks for reaching out!',
      'help': 'I am an automated bot. I can respond to your messages automatically.',
      'price': 'Please check our website for pricing information.',
      'order': 'To place an order, please provide your requirements.',
      'status': 'Let me check your order status for you.',
    },

    // Default reply when no keyword matches
    defaultReply: 'Thanks for your message! We will get back to you soon.',

    // Enable/disable default reply
    useDefaultReply: true,
  },

  // Automatic message sending settings
  autoSend: {
    enabled: false, // Set to true to enable automatic sending

    // Messages to send automatically
    messages: [
      {
        // Phone number with country code (no + or spaces)
        // Example: '1234567890@c.us' for individual
        // or '1234567890-1234567890@g.us' for group
        to: '1234567890@c.us',

        // Message content
        message: 'This is an automated message from WhatsApp Bot!',

        // Schedule settings
        schedule: {
          // Send immediately on bot start
          immediate: false,

          // Interval in milliseconds (e.g., 3600000 = 1 hour)
          // Set to 0 to send only once
          interval: 0,

          // Delay before first send (in milliseconds)
          delay: 5000,
        }
      }
    ]
  },

  // Bot behavior settings
  bot: {
    // Ignore messages from groups (only respond to individual chats)
    ignoreGroups: false,

    // Ignore broadcast messages
    ignoreBroadcast: true,

    // Ignore own messages
    ignoreOwnMessages: true,

    // Log all incoming messages
    logMessages: true,
  },

  // WhatsApp client settings
  client: {
    // Puppeteer args for headless browser
    puppeteerArgs: ['--no-sandbox', '--disable-setuid-sandbox'],

    // Session path (where auth data is stored)
    sessionPath: './.wwebjs_auth',
  }
};
