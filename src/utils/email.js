import { env } from '../config/env.js'

export async function sendOtpEmail(email, otp) {
  const subject = 'AgroProcureBD Email Verification Code'

  const htmlContent = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#142018">
      <h2>AgroProcureBD Email Verification</h2>
      <p>Your verification code is:</p>
      <h1 style="letter-spacing:4px;color:#15803d">${otp}</h1>
      <p>This code will expire in ${env.OTP_EXPIRES_MINUTES} minutes.</p>
      <p>If you did not request this, please ignore this email.</p>
    </div>
  `

  if (!env.BREVO_API_KEY) {
    console.log(`OTP for ${email}: ${otp}`)
    return { skipped: true, message: 'BREVO_API_KEY missing. OTP printed in console.' }
  }

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': env.BREVO_API_KEY,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      sender: {
        name: env.EMAIL_FROM_NAME,
        email: env.EMAIL_FROM
      },
      to: [{ email }],
      subject,
      htmlContent
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Email sending failed: ${errorText}`)
  }

  return response.json()
}
