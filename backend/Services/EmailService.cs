using System.Net;
using System.Net.Mail;

namespace backend.Services
{
    public class EmailService
    {
        // UYARIYI ÇÖZEN KISIM: "= string.Empty;" ekledik
        private readonly string _email = string.Empty;
        private readonly string _password = string.Empty;

        public EmailService(IConfiguration config)
        {
            _email = config["EmailSettings:Email"] ?? string.Empty;
            _password = config["EmailSettings:Password"] ?? string.Empty;
        }

        public async Task SendVerificationCodeAsync(string toEmail, string code)
        {
            var smtpClient = new SmtpClient("smtp.gmail.com")
            {
                Port = 587,
                Credentials = new NetworkCredential(_email, _password),
                EnableSsl = true,
            };

            var mailMessage = new MailMessage
            {
                From = new MailAddress(_email, "Premium Kuaför Randevu"),
                Subject = "Randevu Doğrulama Kodunuz",
                Body = $"<h2>Randevu Doğrulama Kodunuz</h2><p>Randevunuzu tamamlamak için doğrulama kodunuz: <strong style='font-size:24px; color:#f97316;'>{code}</strong></p><p>Bu kod 3 dakika geçerlidir.</p>",
                IsBodyHtml = true,
            };
            mailMessage.To.Add(toEmail);

            await smtpClient.SendMailAsync(mailMessage);
        }
    }
}