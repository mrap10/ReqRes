import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

if (!resend) {
  console.warn(
    "[email] RESEND_API_KEY not set — email sending disabled. Set RESEND_API_KEY to enable."
  );
}

export async function sendVerificationEmail({
  email,
  verificationUrl,
  username,
}: {
  email: string;
  verificationUrl: string;
  username?: string;
}) {
  if (!resend) return { success: false, error: "Email sending disabled — RESEND_API_KEY not set" };
  try {
    const { data, error } = await resend.emails.send({
      from: "ReqRes <onboarding@reqres.online>",
      to: email,
      subject: "Verify your email address",
      html: `
                <!DOCTYPE html>
                <html>
                    <head>
                        <meta charset="utf-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Email Verification</title>
                    </head>
                    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                            <h1 style="color: white; margin: 0; font-size: 28px;">Verify Your Email</h1>
                        </div>
                        
                        <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
                            <p style="font-size: 16px; margin-bottom: 20px;">
                                Hi${username ? ` ${username}` : ""},
                            </p>
                            
                            <p style="font-size: 16px; margin-bottom: 25px;">
                                Thanks for signing up to ReqRes! Please verify your email address by clicking the button below:
                            </p>
                            
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${verificationUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: bold; font-size: 16px;">
                                    Verify Email Address
                                </a>
                            </div>
                            
                            <p style="font-size: 14px; color: #666; margin-top: 25px;">
                                This link will expire in <strong>24 hours</strong>.
                            </p>
                            
                            <p style="font-size: 12px; color: #999; margin-top: 20px;">
                                If the button doesn't work, copy and paste this link into your browser:<br>
                                <a href="${verificationUrl}" style="color: #667eea; word-break: break-all;">${verificationUrl}</a>
                            </p>
                            
                            <p style="font-size: 14px; color: #666; margin-top: 20px;">
                                If you didn't create an account, you can safely ignore this email.
                            </p>
                            
                            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
                            
                            <p style="font-size: 12px; color: #999; text-align: center;">
                                © ${new Date().getFullYear()} ReqRes. All rights reserved.
                            </p>
                        </div>
                    </body>
                </html>
            `,
    });

    if (error) {
      console.error("Failed to send email:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
}

export async function sendPasswordResetEmail({
  email,
  resetUrl,
  username,
}: {
  email: string;
  resetUrl: string;
  username?: string;
}) {
  if (!resend) return { success: false, error: "Email sending disabled — RESEND_API_KEY not set" };
  try {
    const { data, error } = await resend.emails.send({
      from: "ReqRes <onboarding@reqres.online>",
      to: email,
      subject: "Reset your password",
      html: `
                <!DOCTYPE html>
                <html>
                    <head>
                        <meta charset="utf-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Password Reset</title>
                    </head>
                    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                            <h1 style="color: white; margin: 0; font-size: 28px;">Reset Your Password</h1>
                        </div>
                        
                        <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
                            <p style="font-size: 16px; margin-bottom: 20px;">
                                Hi${username ? ` ${username}` : ""},
                            </p>
                            
                            <p style="font-size: 16px; margin-bottom: 25px;">
                                We received a request to reset your password. Click the button below to continue:
                            </p>
                            
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${resetUrl}" style="display: inline-block; padding: 15px 35px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; font-size: 16px; font-weight: bold; border-radius: 8px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
                                    Reset Password
                                </a>
                            </div>
                            
                            <p style="font-size: 14px; color: #666; margin-top: 25px;">
                                This link will expire in <strong>1 hour</strong>.
                            </p>
                            
                            <p style="font-size: 12px; color: #999; margin-top: 15px;">
                                If the button doesn't work, copy and paste this link into your browser:<br>
                                <a href="${resetUrl}" style="color: #667eea; word-break: break-all;">${resetUrl}</a>
                            </p>
                            
                            <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 25px 0; border-radius: 4px;">
                                <p style="margin: 0; font-size: 14px; color: #856404;">
                                    <strong>⚠️ Security Notice:</strong> If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
                                </p>
                            </div>
                            
                            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
                            
                            <p style="font-size: 12px; color: #999; text-align: center;">
                                © ${new Date().getFullYear()} ReqRes. All rights reserved.
                            </p>
                        </div>
                    </body>
                </html>
            `,
    });

    if (error) {
      console.error("Failed to send password reset email:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return { success: false, error };
  }
}

export { resend };
