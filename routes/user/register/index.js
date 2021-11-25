require("dotenv").config();
const path = require("path");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const router = require("express").Router();
const User = require(path.resolve("models/User"));
const { registerValidation } = require(path.resolve("validation"));

const emailTransport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "teamlistener@gmail.com",
    pass: process.env.EMAIL_PASSWORD,
  },
});

router.post("/", async (request, response) => {
  console.debug(`Registration [attempt] ${request.body.email}`);
  const { error } = registerValidation(request.body);
  if (error)
    return response.status(400).send({
      message: "Registration is not valid",
      error: error.details[0].message,
    });

  const emailExists = await User.findOne({ email: request.body.email });
  if (emailExists)
    return response
      .status(400)
      .send({ message: "Email already exists, please log in." });

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(request.body.password, salt);

  const emailConfirmationToken = crypto.randomBytes(64).toString("hex");

  const user = new User({
    username: request.body.username,
    email: request.body.email,
    password: hashedPassword,
    emailConfirmationToken,
  });
  try {
    const savedUser = await user.save();
  } catch (error) {
    return response.status(400).send({ message: "Cannot save user.", error });
  }

  const url = `http://${request.get(
    "host"
  )}/user/confirm?token=${emailConfirmationToken}`;

  const emailHtml = `<!DOCTYPE html>
    <html>
    <head>
    
    <meta charset="utf-8">
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style type="text/css">
  @media screen {
    @font-face {
      font-family: 'Source Sans Pro';
      font-style: normal;
      font-weight: 400;
      src: local('Source Sans Pro Regular'), local('SourceSansPro-Regular'), url(https://fonts.gstatic.com/s/sourcesanspro/v10/ODelI1aHBYDBqgeIAH2zlBM0YzuT7MdOe03otPbuUS0.woff) format('woff');
    }
    @font-face {
      font-family: 'Source Sans Pro';
      font-style: normal;
      font-weight: 700;
      src: local('Source Sans Pro Bold'), local('SourceSansPro-Bold'), url(https://fonts.gstatic.com/s/sourcesanspro/v10/toadOcfmlt9b38dHJxOBGFkQc6VGVFSmCnC_l7QZG60.woff) format('woff');
    }
  }
  body,
  table,
  td,
  a {
    -ms-text-size-adjust: 100%; /* 1 */
    -webkit-text-size-adjust: 100%; /* 2 */
  }
  
  table,
  td {
    mso-table-rspace: 0pt;
    mso-table-lspace: 0pt;
  }

  img {
    -ms-interpolation-mode: bicubic;
  }
  
  a[x-apple-data-detectors] {
    font-family: inherit !important;
    font-size: inherit !important;
    font-weight: inherit !important;
    line-height: inherit !important;
    color: inherit !important;
    text-decoration: none !important;
  }
  
  div[style*="margin: 16px 0;"] {
    margin: 0 !important;
  }
  body {
    width: 100% !important;
    height: 100% !important;
    padding: 0 !important;
    margin: 0 !important;
  }
  
  table {
    border-collapse: collapse !important;
  }
  a {
    color: black;
  }
  img {
    height: auto;
    line-height: 100%;
    text-decoration: none;
    border: 0;
    outline: none;
  }
  </style>
  
</head>
<body style="background-color: #e9ecef;">

  <!-- start preheader -->
  <div class="preheader" style="display: none; max-width: 0; max-height: 0; overflow: hidden; font-size: 1px; line-height: 1px; color: #fff; opacity: 0;">
    Click the confirmation button to activate your account.
  </div>
  <!-- end preheader -->
  
  <!-- start body -->
  <table border="0" cellpadding="0" cellspacing="0" width="100%">
  
  <!-- start hero -->
    <tr>
    <td align="center" bgcolor="#e9ecef">
    <!--[if (gte mso 9)|(IE)]>
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="600">
        <tr>
        <td align="center" valign="top" width="600">
        <![endif]-->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
        <tr>
        <td align="left" bgcolor="#ffffff" style="padding: 36px 24px 0; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; border-top: 3px solid #d4dadf;">
              <h1 style="margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -1px; line-height: 48px;">Confirm Your Email Address</h1>
              </td>
          </tr>
          </table>
          <!--[if (gte mso 9)|(IE)]>
        </td>
        </tr>
        </table>
        <![endif]-->
      </td>
      </tr>
      <!-- end hero -->

    <!-- start copy block -->
    <tr>
      <td align="center" bgcolor="#e9ecef">
        <!--[if (gte mso 9)|(IE)]>
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="600">
        <tr>
        <td align="center" valign="top" width="600">
        <![endif]-->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">

        <!-- start copy -->
        <tr>
        <td align="left" bgcolor="#ffffff" style="padding: 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px;">
        <p style="margin: 0;">Click the button below to confirm your email address. If you did not create an account with <a href="http://teamlistener.com">TeamListener</a>, then ignore this email.</p>
            </td>
            </tr>
          <!-- end copy -->
          
          <!-- start button -->
          <tr>
          <td align="left" bgcolor="#ffffff">
          <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                <td align="center" bgcolor="#ffffff" style="padding: 12px; padding-top: 40px;">
                <table border="0" cellpadding="0" cellspacing="0">
                <tr>
                <td align="center" bgcolor="#f3ca20" style="border-radius: 6px; ">
                <a href="${url}" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 16px 36px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; color: black; text-decoration: none; font-weight: bold; border-radius: 6px;">Confirm email</a>
                        </td>
                        </tr>
                        </table>
                  </td>
                  </tr>
              </table>
              </td>
          </tr>
          <!-- end button -->
          
          </table>
          <!--[if (gte mso 9)|(IE)]>
          </td>
          </tr>
        </table>
        <![endif]-->
        </td>
    </tr>
    <!-- end copy block -->

    <div height="80"/>

    <!-- start footer -->
    <tr>
    <td align="center" bgcolor="#e9ecef" style="padding: 24px;">
    <!--[if (gte mso 9)|(IE)]>
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="600">
        <tr>
        <td align="center" valign="top" width="600">
        <![endif]-->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
        
        <!-- start permission -->
        <tr>
        <td align="center" bgcolor="#e9ecef" style="padding: 12px 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 14px; line-height: 20px; color: #666;">
              <p style="margin: 0;">You received this email because someone used your email address to register at TeamListener. If it was not you, then you can safely ignore and delete this email.</p>
              </td>
              </tr>
          <!-- end permission -->
          
          </table>
        <!--[if (gte mso 9)|(IE)]>
        </td>
        </tr>
        </table>
        <![endif]-->
        </td>
        </tr>
        <!-- end footer -->
        
        </table>
        <!-- end body -->
        
</body>
</html>`;

  emailTransport.sendMail(
    {
      from: { name: "TeamListener", address: "teamlistener@gmail.com" },
      to: request.body.email,
      subject: "Please confirm your email address",
      // html: `Please click <a href="http://${request.get(
      //   "host"
      // )}/user/confirm?token=${emailConfirmationToken}">here</a> to verify your email address.`,
      html: emailHtml,
    },
    (error, info) => {
      if (error) {
        return response
          .status(500)
          .send({ message: "Cannot send verification email.", error });
      } else {
        console.debug(
          `Confirmation email sent [success] ${request.body.email}`
        );
      }
    }
  );
  response.send({ message: "success" });
  console.debug(`Registration [success] ${request.body.email}`);
});

module.exports = router;
