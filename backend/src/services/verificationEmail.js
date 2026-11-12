import axios from "axios";

export function emailConfigured() {
    return Boolean(process.env.RESEND_API_KEY?.trim() && process.env.OTP_FROM_EMAIL?.trim());
}

export async function sendVerificationCode(email, code, challengeId, purpose) {
    const reset = purpose === "password_reset";
    const { data } = await axios.post("https://api.resend.com/emails", {
        from: process.env.OTP_FROM_EMAIL,
        to: [email],
        subject: reset ? "Your Ironclad password reset code" : "Your Ironclad verification code",
        text: `Your Ironclad ${reset ? "password reset" : "verification"} code is ${code}. It expires in 10 minutes. If you did not request this code, you can ignore this email.`,
    }, {
        headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            "Idempotency-Key": `ironclad-otp/${challengeId}`,
        },
        timeout: 8000,
        maxRedirects: 0,
    });
    if (!data?.id) throw new Error("Email provider did not accept the request");
}
