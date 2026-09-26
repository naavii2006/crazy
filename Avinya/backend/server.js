require('dotenv').config();
// Add this line below to force IPv4 and fix the Render timeout issue
require('dns').setDefaultResultOrder('ipv4first');

const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Configure Nodemailer for Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Verify SMTP Connection on Startup
transporter.verify((error) => {
  if (error) {
    console.error('❌ Email server connection error:', error.message);
  } else {
    console.log('✅ Email server is connected and ready to send messages to lightphoton3108@gmail.com');
  }
});

// API Endpoint to process Contact Form
app.post('/api/contact', async (req, res) => {
  console.log('📩 Incoming request received:', req.body);
  const { name, phone, email, company, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ 
      success: false, 
      message: 'Name, Email, and Message are required.' 
    });
  }

  // Email Notification sent directly to lightphoton3108@gmail.com
  const adminMail = {
    from: `"Avinyaa Web Form" <${process.env.EMAIL_USER}>`,
    to: process.env.RECEIVER_EMAIL, // Delivers to lightphoton3108@gmail.com
    replyTo: email, // Clicking "Reply" in Gmail will reply directly to the customer
    subject: `🔔 New Website Enquiry from ${name}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #2e7d32; margin-top: 0;">New Contact Form Submission</h2>
        <hr style="border: 0; border-top: 1px solid #ccc;">
        <p><strong>Customer Name:</strong> ${name}</p>
        <p><strong>Customer Email:</strong> <a href="mailto:${email}">${email}</a></p>
        <p><strong>Phone Number:</strong> ${phone || 'Not Provided'}</p>
        <p><strong>Company / Organisation:</strong> ${company || 'N/A'}</p>
        <p><strong>Message / Enquiry:</strong></p>
        <blockquote style="background: #f9f9f9; border-left: 4px solid #2e7d32; padding: 12px; margin: 0;">
          ${message}
        </blockquote>
      </div>
    `
  };

  // Automated Confirmation Email sent to Customer
  const customerMail = {
    from: `"Avinyaa Food Processing" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Thank you for reaching out to Avinyaa Food Processing',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h3 style="color: #2e7d32;">Hello ${name},</h3>
        <p>Thank you for contacting <strong>Avinyaa Food Processing</strong>.</p>
        <p>We have received your enquiry and our team will get back to you shortly.</p>
        <br>
        <hr style="border: 0; border-top: 1px solid #eee;">
        <p style="font-size: 0.9em; color: #666;">
          <strong>Avinyaa Food Processing</strong><br>
          <em>"From Farmers to Better Choices."</em><br>
          Jalna, Maharashtra, India
        </p>
      </div>
    `
  };

  try {
    await Promise.all([
      transporter.sendMail(adminMail),
      transporter.sendMail(customerMail)
    ]);

    console.log(`✅ Enquiry successfully delivered to ${process.env.RECEIVER_EMAIL}`);
    res.status(200).json({ 
      success: true, 
      message: 'Enquiry sent successfully!' 
    });
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: Unable to send email.' 
    });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running locally at http://localhost:${PORT}`);
});