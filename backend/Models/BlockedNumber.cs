namespace backend.Models
{
    public class BlockedNumber
    {
        public int Id { get; set; }
        public string PhoneNumber { get; set; } = string.Empty;
        public DateTime BlockedAt { get; set; } = DateTime.Now;
    }
}