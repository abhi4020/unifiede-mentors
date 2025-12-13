Email setup & EmailJS instructions

Option A — EmailJS (no server required) ✅

1) Sign up at https://www.emailjs.com/ and create a new Email Service (e.g., Gmail via OAuth/SMTP) and a Mail Template.
2) Create a file named `emailjs-config.js` in the project root (same folder as `index.html`) and add:

```js
window.emailjsConfig = {
  serviceId: 'your_service_id',
  templateId: 'your_template_id',
  publicKey: 'your_public_key',
  // optional: set your recipient
  toEmail: 'abhi4020@yopmail.com'
};
```

3) Do NOT commit `emailjs-config.js` to your public repo (it contains keys). Use `.gitignore` if you keep credentials locally.
4) Open the site; the page will auto-load `emailjs-config.js` if present and the "Send Test (EmailJS)" button will appear in the Contact area.
5) Click "Send Test (EmailJS)" to verify a direct send. The contact form will also use EmailJS when sending.

Troubleshooting & quick checks
- If the "Send Test (EmailJS)" button doesn't appear, confirm `emailjs-config.js` is present in the same folder as `index.html` and defines `window.emailjsConfig` with `serviceId`, `templateId`, and `publicKey`.
- Check the browser DevTools Console for messages — the site logs whether the config was loaded or not.
- Use the "Test Mail Fallback" button in the Contact section to force the fallback modal and verify copy/open behavior.
- If tests fail, check your EmailJS dashboard for template/service IDs and ensure templates have the fields used by your template (e.g., `from_name`, `from_email`, `message`).

Notes:
- This is a convenient client-side option for static sites but keeps your keys on the client; EmailJS public keys are intended to be used this way, but be aware of security risks.

Option B — Server-side (recommended for full control and secrets) ⚙️

If you want stronger security and more control (recommended for production), create a small server endpoint that uses an SMTP library (e.g., nodemailer for Node.js) and have your site POST to it.

Quick Node example (express + nodemailer):

```js
// server/index.js
const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());

const transporter = nodemailer.createTransport({
  host: 'smtp.example.com',
  port: 587,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
});

app.post('/api/send', async (req, res) => {
  const { name, email, message } = req.body;
  await transporter.sendMail({ from: 'site@example.com', to: 'abhi4020@yopmail.com', subject: `Message from ${name}`, text: `Reply to: ${email}\n\n${message}` });
  res.send({ ok: true });
});

app.listen(3000);
```

- This requires deploying a small server and configuring environment variables containing the SMTP credentials.

Which option do you prefer? I can finish the EmailJS wiring here (and help you create `emailjs-config.js`), or I can scaffold a minimal server example and add client code to POST to it.