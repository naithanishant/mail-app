require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sgMail = require('@sendgrid/mail');
const mailchimp = require('@mailchimp/mailchimp_marketing');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configuration
const EMAIL_SERVICE = process.env.EMAIL_SERVICE || 'sendgrid'; // 'sendgrid' or 'mailchimp'
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY;
const MAILCHIMP_SERVER_PREFIX = process.env.MAILCHIMP_SERVER_PREFIX;

// Initialize SendGrid
if (EMAIL_SERVICE === 'sendgrid' && SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
  console.log('SendGrid configured successfully');
}

// Initialize Mailchimp
if (EMAIL_SERVICE === 'mailchimp' && MAILCHIMP_API_KEY) {
  mailchimp.setConfig({
    apiKey: MAILCHIMP_API_KEY,
    server: MAILCHIMP_SERVER_PREFIX,
  });
  console.log('Mailchimp configured successfully');
}

// SendGrid email sending function
async function sendEmailWithSendGrid(emailData) {
  const { to, from, subject, text, html, attachments } = emailData;
  
  const msg = {
    to: Array.isArray(to) ? to : [to],
    from: from || process.env.DEFAULT_FROM_EMAIL,
    subject,
    text,
    html,
  };

  if (attachments && attachments.length > 0) {
    msg.attachments = attachments;
  }

  try {
    const response = await sgMail.send(msg);
    return { success: true, messageId: response[0].headers['x-message-id'] };
  } catch (error) {
    console.error('SendGrid Error:', error);
    throw new Error(`SendGrid error: ${error.message}`);
  }
}

// Mailchimp email sending function
async function sendEmailWithMailchimp(emailData) {
  const { to, from, subject, html, listId } = emailData;
  
  try {
    // For Mailchimp, we typically add subscribers to a list and send campaigns
    if (listId) {
      // Add subscriber to list
      const response = await mailchimp.lists.addListMember(listId, {
        email_address: Array.isArray(to) ? to[0] : to,
        status: 'subscribed',
      });
      
      return { success: true, subscriberId: response.id };
    } else {
      // Send transactional email (requires Mailchimp Transactional API)
      throw new Error('Mailchimp transactional emails require Mailchimp Transactional API (Mandrill)');
    }
  } catch (error) {
    console.error('Mailchimp Error:', error);
    throw new Error(`Mailchimp error: ${error.message}`);
  }
}

// Email validation function
function validateEmailData(emailData) {
  const { to, subject } = emailData;
  
  if (!to || (Array.isArray(to) && to.length === 0)) {
    throw new Error('Recipient email address is required');
  }
  
  if (!subject || subject.trim() === '') {
    throw new Error('Email subject is required');
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const emails = Array.isArray(to) ? to : [to];
  
  for (const email of emails) {
    if (!emailRegex.test(email)) {
      throw new Error(`Invalid email format: ${email}`);
    }
  }
  
  return true;
}

// Routes

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: EMAIL_SERVICE,
    timestamp: new Date().toISOString() 
  });
});

// Get service configuration
app.get('/config', (req, res) => {
  res.json({
    emailService: EMAIL_SERVICE,
    sendgridConfigured: !!SENDGRID_API_KEY,
    mailchimpConfigured: !!MAILCHIMP_API_KEY,
  });
});

// Send email endpoint
app.post('/send-email', async (req, res) => {
  try {
    const emailData = req.body;
    
    // Validate email data
    validateEmailData(emailData);
    
    let result;
    
    if (EMAIL_SERVICE === 'sendgrid') {
      if (!SENDGRID_API_KEY) {
        return res.status(500).json({ error: 'SendGrid API key not configured' });
      }
      result = await sendEmailWithSendGrid(emailData);
    } else if (EMAIL_SERVICE === 'mailchimp') {
      if (!MAILCHIMP_API_KEY) {
        return res.status(500).json({ error: 'Mailchimp API key not configured' });
      }
      result = await sendEmailWithMailchimp(emailData);
    } else {
      return res.status(400).json({ error: 'Invalid email service configuration' });
    }
    
    res.json({
      success: true,
      message: 'Email sent successfully',
      data: result,
      service: EMAIL_SERVICE
    });
    
  } catch (error) {
    console.error('Send email error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      service: EMAIL_SERVICE
    });
  }
});

// Send bulk emails endpoint
app.post('/send-bulk-emails', async (req, res) => {
  try {
    const { emails } = req.body;
    
    if (!Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({ error: 'Emails array is required' });
    }
    
    const results = [];
    const errors = [];
    
    for (let i = 0; i < emails.length; i++) {
      try {
        validateEmailData(emails[i]);
        
        let result;
        if (EMAIL_SERVICE === 'sendgrid') {
          result = await sendEmailWithSendGrid(emails[i]);
        } else if (EMAIL_SERVICE === 'mailchimp') {
          result = await sendEmailWithMailchimp(emails[i]);
        }
        
        results.push({ index: i, success: true, data: result });
      } catch (error) {
        errors.push({ index: i, error: error.message });
      }
    }
    
    res.json({
      success: true,
      totalEmails: emails.length,
      successCount: results.length,
      errorCount: errors.length,
      results,
      errors,
      service: EMAIL_SERVICE
    });
    
  } catch (error) {
    console.error('Bulk email error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      service: EMAIL_SERVICE
    });
  }
});

// Send template-based email endpoint
app.post('/send-template-email', async (req, res) => {
  try {
    const { templateId, templateData, to, subject } = req.body;
    
    if (!templateId) {
      return res.status(400).json({ error: 'Template ID is required' });
    }
    
    const emailData = {
      to,
      subject,
      templateId,
      dynamicTemplateData: templateData
    };
    
    validateEmailData(emailData);
    
    let result;
    
    if (EMAIL_SERVICE === 'sendgrid') {
      // SendGrid dynamic template
      const msg = {
        to: Array.isArray(to) ? to : [to],
        from: process.env.DEFAULT_FROM_EMAIL,
        templateId,
        dynamicTemplateData: templateData || {}
      };
      
      if (subject) {
        msg.subject = subject;
      }
      
      const response = await sgMail.send(msg);
      result = { success: true, messageId: response[0].headers['x-message-id'] };
    } else {
      return res.status(400).json({ error: 'Template emails currently only supported with SendGrid' });
    }
    
    res.json({
      success: true,
      message: 'Template email sent successfully',
      data: result,
      service: EMAIL_SERVICE
    });
    
  } catch (error) {
    console.error('Template email error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      service: EMAIL_SERVICE
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    availableEndpoints: [
      'GET /health',
      'GET /config',
      'POST /send-email',
      'POST /send-bulk-emails',
      'POST /send-template-email'
    ]
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`📧 Email server running on port ${PORT}`);
  console.log(`🔧 Email service: ${EMAIL_SERVICE}`);
  console.log(`🌐 Server URL: http://localhost:${PORT}`);
  console.log('\nAvailable endpoints:');
  console.log('  GET  /health - Health check');
  console.log('  GET  /config - Service configuration');
  console.log('  POST /send-email - Send single email');
  console.log('  POST /send-bulk-emails - Send multiple emails');
  console.log('  POST /send-template-email - Send template-based email');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});
