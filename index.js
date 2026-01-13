const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const config = require('./config');

// Initialize the WhatsApp client
const puppeteerConfig = {
  args: config.client.puppeteerArgs
};

// Add executablePath if specified in config
if (config.client.executablePath) {
  puppeteerConfig.executablePath = config.client.executablePath;
}

const client = new Client({
  authStrategy: new LocalAuth({
    dataPath: config.client.sessionPath
  }),
  puppeteer: puppeteerConfig
});

// Store for scheduled message intervals
const scheduledMessages = new Map();

// Initialize the bot
console.log('🤖 Starting WhatsApp Bot...');

// Generate QR Code for authentication
client.on('qr', (qr) => {
  console.log('\n📱 Scan this QR code with your WhatsApp:');
  qrcode.generate(qr, { small: true });
  console.log('\n⏳ Waiting for QR code scan...\n');
});

// Client is ready
client.on('ready', () => {
  console.log('✅ WhatsApp Bot is ready!');
  console.log('📞 Connected as:', client.info.pushname);
  console.log('📱 Phone:', client.info.wid.user);
  console.log('━'.repeat(50));

  // Start automatic message sending if enabled
  if (config.autoSend.enabled) {
    startAutoSend();
  }

  if (config.autoReply.enabled) {
    console.log('✉️  Auto-reply is enabled');
  }

  console.log('\n💬 Bot is now listening for messages...\n');
});

// Handle authentication
client.on('authenticated', () => {
  console.log('🔐 Authentication successful!');
});

// Handle authentication failure
client.on('auth_failure', (msg) => {
  console.error('❌ Authentication failed:', msg);
});

// Handle disconnection
client.on('disconnected', (reason) => {
  console.log('⚠️  Client was disconnected:', reason);
  // Clear all scheduled messages
  scheduledMessages.forEach(interval => clearInterval(interval));
  scheduledMessages.clear();
});

// Handle incoming messages
client.on('message', async (message) => {
  try {
    // Log message if enabled
    if (config.bot.logMessages) {
      const chat = await message.getChat();
      const contact = await message.getContact();
      console.log(`📨 Message from ${contact.name || contact.pushname} (${message.from}): ${message.body}`);
    }

    // Ignore if auto-reply is disabled
    if (!config.autoReply.enabled) return;

    // Ignore own messages
    if (config.bot.ignoreOwnMessages && message.fromMe) return;

    // Ignore group messages if configured
    if (config.bot.ignoreGroups && message.from.endsWith('@g.us')) return;

    // Ignore broadcast messages if configured
    if (config.bot.ignoreBroadcast && message.from === 'status@broadcast') return;

    // Check for keyword matches
    const messageBody = message.body.toLowerCase();
    let replied = false;

    for (const [keyword, response] of Object.entries(config.autoReply.keywords)) {
      if (messageBody.includes(keyword.toLowerCase())) {
        await message.reply(response);
        console.log(`✅ Auto-replied with keyword: "${keyword}"`);
        replied = true;
        break; // Only send one reply per message
      }
    }

    // Send default reply if no keyword matched and default reply is enabled
    if (!replied && config.autoReply.useDefaultReply) {
      await message.reply(config.autoReply.defaultReply);
      console.log('✅ Auto-replied with default message');
    }

  } catch (error) {
    console.error('❌ Error handling message:', error);
  }
});

// Function to send a message
async function sendMessage(to, message) {
  try {
    await client.sendMessage(to, message);
    console.log(`✅ Message sent to ${to}`);
    return true;
  } catch (error) {
    console.error(`❌ Error sending message to ${to}:`, error);
    return false;
  }
}

// Function to start automatic message sending
function startAutoSend() {
  console.log('\n🚀 Starting automatic message sending...');

  config.autoSend.messages.forEach((msgConfig, index) => {
    const { to, message, schedule } = msgConfig;

    // Send immediately if configured
    if (schedule.immediate) {
      setTimeout(() => {
        sendMessage(to, message);
      }, 1000); // Small delay to ensure client is ready
    }

    // Schedule with delay
    if (schedule.delay > 0 || !schedule.immediate) {
      setTimeout(() => {
        sendMessage(to, message);

        // Set up interval if configured
        if (schedule.interval > 0) {
          const intervalId = setInterval(() => {
            sendMessage(to, message);
          }, schedule.interval);

          scheduledMessages.set(`msg_${index}`, intervalId);
          console.log(`⏰ Scheduled message ${index + 1} to repeat every ${schedule.interval}ms`);
        }
      }, schedule.delay);
    }
  });
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n\n🛑 Shutting down bot...');

  // Clear all scheduled messages
  scheduledMessages.forEach(interval => clearInterval(interval));
  scheduledMessages.clear();

  await client.destroy();
  console.log('✅ Bot stopped successfully');
  process.exit(0);
});

// Start the client
client.initialize();
