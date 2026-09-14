const nodemailer = require("nodemailer");

const MAX_NAME_LENGTH = 100;
const MAX_SUBJECT_LENGTH = 150;
const MAX_MESSAGE_LENGTH = 5000;

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const sendContactMessage = async (req, res) => {
  try {
    const {
      name = "",
      email = "",
      subject = "",
      message = "",
      website = "",
    } = req.body;

    // Quietly accept bot submissions caught by the hidden honeypot field.
    if (website) {
      return res.status(200).json({
        success: true,
        message: "Your message has been sent.",
      });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanSubject = subject.trim();
    const cleanMessage = message.trim();

    if (!cleanName || !cleanEmail || !cleanSubject || !cleanMessage) {
      return res.status(400).json({
        success: false,
        message: "Name, email, subject, and message are required.",
      });
    }

    if (
      cleanName.length > MAX_NAME_LENGTH ||
      cleanSubject.length > MAX_SUBJECT_LENGTH ||
      cleanMessage.length > MAX_MESSAGE_LENGTH
    ) {
      return res.status(400).json({
        success: false,
        message: "One or more fields exceed the allowed length.",
      });
    }

    if (!isValidEmail(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: process.env.CONTACT_RECEIVER,
      replyTo: cleanEmail,
      subject: `[Website Contact] ${cleanSubject}`,
      text: [
        `Name: ${cleanName}`,
        `Email: ${cleanEmail}`,
        "",
        "Message:",
        cleanMessage,
      ].join("\n"),
    });

    return res.status(200).json({
      success: true,
      message: "Thank you. Your message has been sent.",
    });
  } catch (error) {
    console.error("Contact form email error:", error.message);

    return res.status(500).json({
      success: false,
      message: "We could not send your message right now. Please try again later.",
    });
  }
};

module.exports = { sendContactMessage };