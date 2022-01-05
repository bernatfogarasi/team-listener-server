const nodemailer = require("nodemailer");

const emailTransport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "teamlistener@gmail.com",
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendConfirmationEmail = (to, confirmationToken) => {
  const url = `http://${request.get(
    "host"
  )}/user/confirm?token=${confirmationToken}`;

  const html = `Please click <a href="${url}">here</a> to verify your email address.`;

  var emailError;
  emailTransport.sendMail(
    {
      from: { name: "TeamListener", address: "teamlistener@gmail.com" },
      to,
      subject: "Please confirm your email address",
      html,
    },
    (error, info) => {
      console.log("error", error);
      console.log("info", info);
      console.log("isError", Boolean(error));
      if (error) {
        emailError = error;
      } else {
        console.debug(`Confirmation email sent [success] ${to}`);
      }
    }
  );
  return { error: emailError };
};

module.exports = { sendConfirmationEmail };
