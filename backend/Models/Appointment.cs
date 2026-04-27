namespace backend.Models
{
    public class Appointment
    {
        public int Id { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string ServiceType { get; set; } = string.Empty; 
        public DateTime AppointmentDate { get; set; } // Tarih ve Saat tek alanda tutulabilir veya ayırabiliriz, şimdilik böyle kalsın
        public string Status { get; set; } = "Onay Bekliyor"; 
        
        // Yeni Eklenenler:
        public string? VerificationCode { get; set; } 
        public DateTime? CodeExpiration { get; set; } 
    }
}