const express = require("express");
const { PrismaClient } = require("@prisma/client");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 4000;
const cors = require("cors");

app.use(cors());
app.use(express.json());

app.post("/referrals", async (req, res) => {
  const { referrerName, referrerEmail, refereeName, refereeEmail } = req.body;

  if (!referrerName || !referrerEmail || !refereeName || !refereeEmail) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const referral = await prisma.Referral.create({
      data: {
        referrerName,
        referrerEmail,
        refereeName,
        refereeEmail,
      },
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: refereeEmail,
      subject: "You have been referred!",
      text: `Hi ${refereeName},\n\n${referrerName} has referred you to our service. Please contact us for more details.\n\nBest regards,\nYour Company`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        return res.status(500).json({ error: "Error sending email" });
      }
      res.status(201).json(referral);
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Error creating referral" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
