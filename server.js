const express = require("express");
const { PrismaClient } = require("@prisma/client");
// const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const mysql = require("mysql2");

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 4000;
const cors = require("cors");

app.use(cors());
app.use(express.json());

const dbConfig = {
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE_NAME,
  port: 3306,
};

const pool = mysql.createPool(dbConfig);

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

    pool.query(
      "INSERT INTO referrals (referrerName, referrerEmail, refereeName, refereeEmail) VALUES (?, ?, ?, ?)",
      [referrerName, referrerEmail, refereeName, refereeEmail],
      (error, results, fields) => {
        if (error) {
          console.error("Error creating referral:", error);
          return res.status(500).json({ error: "Error creating referral" });
        }
          res.status(201).json(referral); // Return the referral data if needed

        // Send referral email
        // const transporter = nodemailer.createTransport({
        //   service: "gmail",
        //   auth: {
        //     user: process.env.GMAIL_USER,
        //     pass: process.env.GMAIL_PASS,
        //   },
        // });

        // const mailOptions = {
        //   from: process.env.GMAIL_USER,
        //   to: refereeEmail,
        //   subject: "You have been referred!",
        //   text: `Hi ${refereeName},\n\n${referrerName} has referred you to our service. Please contact us for more details.\n\nBest regards,\nYour Company`,
        // };

        // transporter.sendMail(mailOptions, (error, info) => {
        //   if (error) {
        //     console.error("Error sending email:", error);
        //     return res.status(500).json({ error: "Error sending email" });
        //   }
        //   res.status(201).json(referral); // Return the referral data if needed
        // });
      }
    );
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Error creating referral" });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
