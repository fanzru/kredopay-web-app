import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export interface SendOTPEmailParams {
  email: string;
  otpCode: string;
}

export async function sendOTPEmail({
  email,
  otpCode,
}: SendOTPEmailParams): Promise<{ success: boolean; error?: string }> {
  try {
    const fromEmail =
      process.env.RESEND_FROM_EMAIL || "KredoPay <noreply@kredopay.app>";

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: "Your KredoPay Login Code",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Your KredoPay Login Code</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #000000;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #000000; padding: 60px 20px;">
              <tr>
                <td align="center">
                  <!-- Main Container -->
                  <table width="600" cellpadding="0" cellspacing="0" style="background-color: #000000; border: 1px solid #18181b; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);">
                    
                    <!-- Header with Logo -->
                    <tr>
                      <td style="padding: 48px 48px 32px 48px; text-align: center; background: linear-gradient(180deg, #000000 0%, #09090b 100%);">
                        <h1 style="margin: 0 0 8px 0; color: #ffffff; font-size: 32px; font-weight: 800; letter-spacing: -0.5px;">
                          Kredo<span style="background: linear-gradient(135deg, #818cf8 0%, #a78bfa 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">Pay</span>
                        </h1>
                        <p style="margin: 0; color: #52525b; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px;">
                          Secure Authentication
                        </p>
                      </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                      <td style="padding: 0 48px 48px 48px; background-color: #000000;">
                        <!-- Greeting -->
                        <p style="margin: 0 0 32px 0; color: #a1a1aa; font-size: 16px; line-height: 24px; text-align: center;">
                          Your verification code is ready
                        </p>
                        
                        <!-- OTP Code Box -->
                        <div style="background: linear-gradient(135deg, #18181b 0%, #09090b 100%); border: 2px solid #27272a; border-radius: 16px; padding: 32px; text-align: center; margin-bottom: 32px; position: relative; overflow: hidden;">
                          <!-- Glow effect -->
                          <div style="position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: radial-gradient(circle, rgba(129, 140, 248, 0.1) 0%, transparent 70%); pointer-events: none;"></div>
                          
                          <!-- OTP Code -->
                          <div style="position: relative; font-size: 48px; font-weight: 800; color: #ffffff; letter-spacing: 12px; font-family: 'Courier New', monospace; text-shadow: 0 0 20px rgba(129, 140, 248, 0.3);">
                            ${otpCode}
                          </div>
                        </div>
                        
                        <!-- Info Box -->
                        <div style="background-color: #09090b; border: 1px solid #18181b; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                          <p style="margin: 0 0 12px 0; color: #e4e4e7; font-size: 14px; line-height: 20px; font-weight: 600;">
                            ⏱️ Valid for 10 minutes
                          </p>
                          <p style="margin: 0; color: #71717a; font-size: 13px; line-height: 18px;">
                            This code will expire in 10 minutes. Don't share it with anyone.
                          </p>
                        </div>
                        
                        <!-- Security Notice -->
                        <div style="text-align: center; padding: 20px; background-color: #09090b; border: 1px solid #18181b; border-radius: 12px;">
                          <p style="margin: 0; color: #52525b; font-size: 12px; line-height: 18px;">
                            🔒 If you didn't request this code, please ignore this email.<br/>
                            Your account security is our top priority.
                          </p>
                        </div>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="padding: 32px 48px; text-align: center; border-top: 1px solid #18181b; background-color: #000000;">
                        <p style="margin: 0 0 8px 0; color: #3f3f46; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">
                          Protected by Kredo Auth
                        </p>
                        <p style="margin: 0; color: #27272a; font-size: 11px;">
                          © ${new Date().getFullYear()} KredoPay. All rights reserved.
                        </p>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- Bottom Spacing -->
                  <table width="600" cellpadding="0" cellspacing="0" style="margin-top: 24px;">
                    <tr>
                      <td style="text-align: center; padding: 0 20px;">
                        <p style="margin: 0; color: #27272a; font-size: 11px; line-height: 16px;">
                          This is an automated message, please do not reply to this email.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to send OTP email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
