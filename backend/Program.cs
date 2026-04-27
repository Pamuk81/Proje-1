using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Veritabanı Bağlantısı
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Mail Servisini sisteme tanıtıyoruz
builder.Services.AddSingleton<backend.Services.EmailService>();

// React (Frontend) için CORS İzni
builder.Services.AddCors(options => {
    options.AddDefaultPolicy(policy => {
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors(); // CORS'u aktifleştir


// ==========================================
// 1. MÜŞTERİ (RANDEVU) UÇ NOKTALARI
// ==========================================

// Randevu Başvurusu
app.MapPost("/api/randevu/basvur", async (AppDbContext db, backend.Services.EmailService emailService, Appointment req) =>
{
    // ENGELLİ NUMARA KONTROLÜ
    var isBlocked = await db.BlockedNumbers.AnyAsync(b => b.PhoneNumber == req.PhoneNumber);
    if (isBlocked) 
    {
        return Results.BadRequest("Bu telefon numarası sistem tarafından engellenmiştir. Randevu alınamaz.");
    }

    // ÇAKIŞMA KONTROLÜ
    var mevcutRandevu = await db.Appointments
        .FirstOrDefaultAsync(a => a.AppointmentDate == req.AppointmentDate && (a.Status == "Onaylandı" || a.Status == "Onay Bekliyor"));
    
    if (mevcutRandevu != null) return Results.BadRequest("Seçtiğiniz tarih ve saat doludur. Lütfen başka bir saat seçiniz.");

    var random = new Random();
    req.VerificationCode = random.Next(100000, 999999).ToString();
    req.CodeExpiration = DateTime.Now.AddMinutes(3); 
    req.Status = "Onay Bekliyor";

    db.Appointments.Add(req);
    await db.SaveChangesAsync();

    await emailService.SendVerificationCodeAsync(req.Email, req.VerificationCode);

    return Results.Ok(new { message = "Doğrulama kodu gönderildi", appointmentId = req.Id });
});

// Gelen Kodu Doğrula
app.MapPost("/api/randevu/dogrula", async (AppDbContext db, int appointmentId, string code) =>
{
    var appointment = await db.Appointments.FindAsync(appointmentId);
    
    if (appointment == null) return Results.NotFound("Randevu bulunamadı.");
    if (appointment.CodeExpiration < DateTime.Now) return Results.BadRequest("Kodun süresi dolmuş.");
    if (appointment.VerificationCode != code) return Results.BadRequest("Hatalı kod girdiniz.");

    appointment.Status = "Onaylandı";
    appointment.VerificationCode = null; 
    await db.SaveChangesAsync();

    return Results.Ok(new { message = "Randevunuz başarıyla alınmıştır!" });
});

// YENİ EKLENEN: Seçilen tarihe göre DOLU SAATLERİ getir
app.MapGet("/api/randevu/dolu-saatler", async (AppDbContext db, string date) => 
{
    if (!DateTime.TryParse(date, out DateTime parsedDate)) return Results.BadRequest();

    var doluSaatler = await db.Appointments
        .Where(a => a.AppointmentDate.Date == parsedDate.Date && (a.Status == "Onaylandı" || a.Status == "Onay Bekliyor"))
        .Select(a => a.AppointmentDate.ToString("HH:mm"))
        .ToListAsync();
        
    return Results.Ok(doluSaatler);
});

// Telefon Numarasına Göre Randevuları Listele
app.MapGet("/api/randevu/listele", async (AppDbContext db, string phone) => 
{
    var randevular = await db.Appointments
        .Where(a => a.PhoneNumber == phone && a.Status == "Onaylandı" && a.AppointmentDate >= DateTime.Now)
        .OrderBy(a => a.AppointmentDate)
        .ToListAsync();
        
    return Results.Ok(randevular);
});

// Randevuyu Sil (İptal Et)
app.MapDelete("/api/randevu/sil/{id}", async (AppDbContext db, int id) => 
{
    var randevu = await db.Appointments.FindAsync(id);
    if (randevu == null) return Results.NotFound("Randevu bulunamadı.");

    db.Appointments.Remove(randevu);
    await db.SaveChangesAsync();
    
    return Results.Ok(new { message = "Randevunuz iptal edilmiştir." });
});


// ==========================================
// 2. ADMİN (BERBER) UÇ NOKTALARI
// ==========================================

// Tüm Aktif Randevuları Getir
app.MapGet("/api/admin/randevular", async (AppDbContext db) => 
{
    var randevular = await db.Appointments
        .Where(a => a.Status == "Onaylandı" || a.Status == "Onay Bekliyor")
        .OrderBy(a => a.AppointmentDate)
        .ToListAsync();
        
    return Results.Ok(randevular);
});

// Telefon Numarasını Engelle
app.MapPost("/api/admin/engelle", async (AppDbContext db, string phone) => 
{
    var alreadyBlocked = await db.BlockedNumbers.AnyAsync(b => b.PhoneNumber == phone);
    if (!alreadyBlocked)
    {
        db.BlockedNumbers.Add(new BlockedNumber { PhoneNumber = phone });
        
        // Engellenen kişinin ileri tarihli randevularını otomatik iptal et
        var futureAppointments = await db.Appointments
            .Where(a => a.PhoneNumber == phone && a.AppointmentDate >= DateTime.Now)
            .ToListAsync();
            
        db.Appointments.RemoveRange(futureAppointments);
        
        await db.SaveChangesAsync();
    }
    return Results.Ok(new { message = "Numara başarıyla engellendi ve mevcut randevuları silindi." });
});

// Uygulamayı Başlat
app.Run("http://0.0.0.0:5160");