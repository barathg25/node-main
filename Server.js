const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const cors = require("cors");
const mysql = require("mysql");
const { google } = require("googleapis");
const sheets = google.sheets("v4");
const fs = require("fs");
const drive = google.drive("v3");

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3003;

app.use(cors());
app.use(bodyParser.json());

const credentials = JSON.parse(
  fs.readFileSync("./eduprenuer-425310-1c99fd4d8b22.json")
);

const authClient = new google.auth.JWT(
  credentials.client_email,
  null,
  credentials.private_key,
  [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
  ]
);

authClient.authorize((err, tokens) => {
  if (err) {
    console.error("Error authorizing client:", err);
    return;
  } 

  console.log("Successfully connected to Google Sheets and Drive API");
  
  // Update the sheet with data
});

function updateSheet(auth, name, email, phone) {
  const spreadsheetId = "1Ws_jdbwD-aycM_eTYq5_1W3jvflNg6D_VWfNOli0uGA"; // Replace with your Spreadsheet ID
  const range = "Sheet1!A1";
  const request1 = {
    auth: auth,
    spreadsheetId: spreadsheetId,
    range: range,
    valueInputOption: "RAW",
    resource: {
      values: [
       
        [name, email, phone],
      ],
    },
  };
  sheets.spreadsheets.values.append(request1, (err, response) => {
    if (err) {
      console.error("Error appending data to sheet:", err);
      return;
    }

    console.log("Data appended to sheet:", response.data);
  });
}

// function moveFileToMyDrive(auth, fileId) {
//   const userEmail = "revathi.edupreneur@gmail.com"; // Replace with your email

//   const permissions = {
//     auth: auth,
//     resource: {
//       role: "writer",
//       type: "user",
//       emailAddress: userEmail,
//     },
//     fileId: fileId,
//     sendNotificationEmail: false,
//   };
//   drive.permissions.create(permissions, (err, response) => {
//     if (err) {
//       console.error("Error sharing sheet:", err);
//       return;
//     }

//     console.log("Sheet shared with user:", response.data);

//     // Optionally, move the shared sheet to "My Drive"
//     // moveFileToMyDrive(auth, sheetId);
//   });

//   const request = {
//     auth: auth,
//     fileId: fileId,
//     addParents: "root",
//     fields: "id, parents",
//   };

//   drive.files.update(request, (err, response) => {
//     if (err) {
//       console.error("Error moving file to My Drive:", err);
//       return;
//     }

//     console.log("File moved to My Drive:", response.data);
//   });
// }

const pool = mysql.createPool({
  connectionLimit: 10,
  host: "wishitondev.ccswjz3ohrkl.ap-south-1.rds.amazonaws.com",
  user: "admin",
  password: "DevTTH321$",
  database: "webinar",
});

pool.getConnection((err, connection) => {
  if (err) {
    console.error("Error connecting to database:", err.message);
    return;
  }
  console.log("Connected to database successfully");
  connection.release(); // Release the connection when done
});

// Create transporter
const transporter = nodemailer.createTransport({
  host: "smtppro.zoho.in",
  port: 465,
  secure: true,
  auth: {
    user: "info@thetechhorse.com",
    pass: "27032024@Tth",
  },
});
//Webinar Transporter
const webinarTransporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "revathi.edupreneur@gmail.com",
    pass: "mfyc ekmy hzql zzof",
  },
});


// Function to send acknowledgment email
async function sendAcknowledgmentEmail(name, userEmail, subject, message) {
  const replytext = `Hello ${name}

Welcome to The Tech Horse Technology !
  
  Myself Alisha , Business Development Manager. We are an Indian Web Design and Development firm having experts of 20+ years experience in TEchnology industry. We are an ISO 9001: 2008 IT Company with 15 IT professionals into website designing, web development, iPhone App development, Android App development, SEO, Content Writing.
  
  We offer following Services:
  
  (1)   Web Designing/Development Services.
  
  (2)   Website Customization in CMS (Joomla/WordPress/Drupal/Magento/Zencart etc.) Services.
  
  (3)   SEO/SMO/PPC/ Services.
  
  (4)   iPhone App Development Services.
  
  (5)   iPad App Development Services.
  
  (6)   Android App Development Services.
  
  (7)   Website Re-Designing Services .
  
  (8)   Content Writing Services .
  
  (9)   Facebook App Development Services .
  
  (10)  Customized Page Development .
  
  (11)  Logo/Graphics/Catalogue/ Brochure Services.
  
  (12)  Newsletter/E-Flyer Services.
  
  (13)  Flash/Animation Services.
  
        We also Develop hybrid Mobile and web Applications for business developement purpose .
  
  (14)  Restaurant App
  
  (15)  Real Estate App
  
  (16)  Health & Fitness App
  
  (15)  I Phone and I Pad apps
  
  (16)  E-Commerce App
  
  (17)  Transport App
  
  (18)  Shopping App
  
Would you like to build any mobile App ? We are currently working technologies for Mobile Apps and Web services .
In Which Types Apps (Android, IOS,) do you need please lets us know if you are interested in any of these services?
If you are interested, then I can send you our past work details, company information, affordable quotation with best offer.
You can get more information.
  
  
Thanks & Regards,
Alisha
  
Business Development Manager
  
Email id- info@thetechhorse.com`;

  const mailOptions = {
    from: "info@thetechhorse.com",
    to: userEmail,
    subject: subject,
    text: replytext,
  };

  // Send mail
  await transporter.sendMail(mailOptions);
}

// Function to forward request to info@thetechhorse.com
async function forwardRequestToInfo(
  name,
  userEmail,
  mail,
  userPhonenumber,
  subject,
  message
) {
  const forwardmessage = `Dear The TechHorse Admin,\n\n${name} wants to contact you at ${userEmail}. Here is the message:\n\n${message} ${
    userPhonenumber ? userPhonenumber : ""
  }`;

  const mailOptions = {
    from: mail,
    to: "info@thetechhorse.com",
    subject: subject,
    text: forwardmessage,
  };

  // Send mail
  await transporter.sendMail(mailOptions);
}

app.post("/ContactUs", async (req, res) => {
  const { name, userEmail, userPhonenumber, subject, message } = req.body;

  try {
    // Send acknowledgment email and forward request email in parallel
    await Promise.all([
      forwardRequestToInfo(
        name,
        userEmail,
        "info@thetechhorse.com",
        userPhonenumber,
        subject,
        message
      ),
      sendAcknowledgmentEmail(name, userEmail, subject, message),
    ]);

    res.status(200).send("Request sent successfully");
  } catch (error) {
    console.error("Error processing request:", error.message);
    res.status(500).send("Error processing request");
  }
});
//.........................................Webinar Website................................//
async function webinarAcknowledgeMail(name, email, phone) {
  const forwardmessage = `Dear Revathi Asokan,\n\n New Registraion Alert!!\n\nNew Webinar Member named ${name} and this is the user mail ID ${email}. Here is the mobile number: ${phone}`;

  const mailOptions = {

    to: "revathi.edupreneur@gmail.com",
    subject: "Alert!!! New Member Registered",
    text: forwardmessage,
  };
  updateSheet(authClient, name, email, phone);
  // Send mail
  await webinarTransporter.sendMail(mailOptions);

  webinarALLMail();

}

async function webinarALLMail() {
  // Query to fetch all data from the 'user' table
  const sqlSelect = "SELECT * FROM user";

  // Execute the query
  pool.query(sqlSelect, async (err, rows) => {
    if (err) {
      console.error("Error fetching data:", err.message);
      return;
    }

    // Configure the email options
    const mailOptions = {
      from: "revathi.edupreneur@gmail.com",
      to: "revathi.edupreneur@gmail.com",
      subject: "All Registered Members",
      text: rows,
    };

    try {
      // Send the email
      await webinarTransporter.sendMail(mailOptions);
      console.log("Email sent successfully");
    } catch (error) {
      console.error("Error sending email:", error);
      // Handle the error
    }
  });
}

async function sendWebinarMailToUser(name, mail) {
  const replytext = `Hi ${name},

Thank you for the Business Startup Webinar 

The webinar has been designed to give you a clear item about how to convert your passion into a profitable business. Looking forward to see you for this energetic session which can change your perception about business.

Here is the webinar details:

Date: 9th June 2025
Time: 9AM to 12PM
Access link:
https://us04web.zoom.us/j/73920152994?pwd=btH8vR19KjW2Vw1dAguVyJ6iD6uKnr.1

Meeting ID: 739 2015 2994
Passcode: wa143f

For any enquiries send us an email at 
revathi.edupreneur@gmail.com

Regards,
Revathi Asokan.

  `;

  const mailOptions = {
    from: "revathi.edupreneur@gmail.com",
    to: mail,
    subject: `Thank you ${name} for registering for Business startup webinar`,
    text: replytext,
  };

  // Send mail

  await webinarTransporter.sendMail(mailOptions);
}
app.post("/send-acknowledge", async (req, res) => {
  const { name, email, phone } = req.body;

  // Assuming your_table_name has fields named name, email, and phone
  const sql = "INSERT INTO user (name, email, phone) VALUES (?, ?, ?)"; 
  const values = [name, email, phone];

  pool.query(sql, values, (err, results) => {
    if (err) {
      console.error("Error inserting data:", err.sqlMessage);
      return res.status(500).json({ error: "Error inserting data" });
    }
    console.log("Data inserted successfully");
    return res.status(200).json({ message: "Data inserted successfully" });
  });


  try {
    // Send acknowledgment email and forward request email in parallel
    await Promise.all([
      sendWebinarMailToUser(name, email),
      webinarAcknowledgeMail(name, email, phone),
    ]);

    res.status(200).send("Request sent successfully");
  } catch (error) {
    console.error("Error processing request:", error.message);
    res.status(500).send("Error processing request");
  }
});
//............................................News Letter............................................//
app.post("/news-letter", async (req, res) => {
  const { newletterEmail } = req.body;
  try {
    await Promise.all([
      forwardNewsletter(newletterEmail),
      sendAcknowledgmentnewLetter(newletterEmail),
    ]);
    res.status(200).send("Request sent successfully");
  } catch (error) {
    console.error("Error processing request:", error.message);
    res.status(500).send("Error processing request");
  }
});

async function forwardNewsletter(newletterEmail) {
  const mailOptions = {
    from: "info@thetechhorse.com",
    to: "info@thetechhorse.com",
    subject: "NewsLetter Subscription",
    text: `We have new member ${newletterEmail}`,
  };

  // Send mail
  await transporter.sendMail(mailOptions);
}

async function sendAcknowledgmentnewLetter(newletterEmail) {
  const mailOptions = {
    from: "info@thetechhorse.com",
    to: newletterEmail,
    subject: "NewsLetter Subscription",
    text: "Thanks for Subscription",
  };

  // Send mail
  await transporter.sendMail(mailOptions);
  console.log("Newsletteracksuccess");
}

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
