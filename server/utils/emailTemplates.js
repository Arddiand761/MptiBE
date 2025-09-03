// server/utils/emailTemplates.js
export function bookingApprovalTemplate(data) {
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://mptibe-production.up.railway.app' 
    : 'http://localhost:3001';
  
  return `
    <div style="font-family:Arial, sans-serif;max-width:600px;margin:auto;border:1px solid #eee;padding:24px;">
      <div style="text-align:center;margin-bottom:20px;background:#f8f9fa;padding:20px;">
        <h1 style="color:#2d5016;margin:0;font-size:28px;">⚖️ Anas Law</h1>
        <p style="color:#666;margin:5px 0 0 0;">Solusi Hukum Terpercaya</p>
      </div>
      <h2 style="color:#2d5016;">Booking Disetujui</h2>
      <p>Halo <b>${data.nama_pembooking}</b>,</p>
      <p>Booking Anda telah <b style="color:#4caf50;">disetujui</b> oleh ${data.lawyer_name}.</p>
      <div style="background-color:#f5f5f5;padding:15px;border-radius:5px;margin:20px 0;">
        <h3 style="margin-top:0;color:#333;">Detail Booking:</h3>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:5px 0;"><b>ID Booking:</b></td><td style="padding:5px 0;">${data.booking_id}</td></tr>
          <tr><td style="padding:5px 0;"><b>Lawyer:</b></td><td style="padding:5px 0;">${data.lawyer_name}</td></tr>
          <tr><td style="padding:5px 0;"><b>Spesialisasi:</b></td><td style="padding:5px 0;">${data.specialty}</td></tr>
          <tr><td style="padding:5px 0;"><b>Tanggal:</b></td><td style="padding:5px 0;">${data.tanggal_booking}</td></tr>
          <tr><td style="padding:5px 0;"><b>Waktu:</b></td><td style="padding:5px 0;">${data.waktu_booking}</td></tr>
          <tr><td style="padding:5px 0;"><b>No. HP:</b></td><td style="padding:5px 0;">${data.nomor_handphone}</td></tr>
        </table>
      </div>
      <p style="color:#4caf50;font-weight:bold;">✅ Silakan hadir sesuai jadwal yang telah ditentukan.</p>
      <p>Jika ada pertanyaan, silakan hubungi kami di nomor yang tertera.</p>
      <hr style="margin:30px 0;border:none;border-top:1px solid #ddd;">
      <small style="color:#666;">© 2025 Anas Law - Solusi Hukum Terpercaya</small>
    </div>
  `;
}

export function bookingRejectionTemplate(data) {
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://mptibe-production.up.railway.app' 
    : 'http://localhost:3001';
    
  return `
    <div style="font-family:Arial, sans-serif;max-width:600px;margin:auto;border:1px solid #eee;padding:24px;">
      <div style="text-align:center;margin-bottom:20px;background:#f8f9fa;padding:20px;">
        <h1 style="color:#d32f2f;margin:0;font-size:28px;">⚖️ Anas Law</h1>
        <p style="color:#666;margin:5px 0 0 0;">Solusi Hukum Terpercaya</p>
      </div>
      <h2 style="color:#d32f2f;">Booking Ditolak</h2>
      <p>Halo <b>${data.nama_pembooking}</b>,</p>
      <p>Mohon maaf, booking Anda <b style="color:#f44336;">ditolak</b> oleh ${data.lawyer_name}.</p>
      <div style="background-color:#fff3e0;padding:15px;border-radius:5px;margin:20px 0;border-left:4px solid #ff9800;">
        <h3 style="margin-top:0;color:#333;">Detail Booking:</h3>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:5px 0;"><b>ID Booking:</b></td><td style="padding:5px 0;">${data.booking_id}</td></tr>
          <tr><td style="padding:5px 0;"><b>Lawyer:</b></td><td style="padding:5px 0;">${data.lawyer_name}</td></tr>
          <tr><td style="padding:5px 0;"><b>Spesialisasi:</b></td><td style="padding:5px 0;">${data.specialty}</td></tr>
          <tr><td style="padding:5px 0;"><b>Tanggal:</b></td><td style="padding:5px 0;">${data.tanggal_booking}</td></tr>
          <tr><td style="padding:5px 0;"><b>Waktu:</b></td><td style="padding:5px 0;">${data.waktu_booking}</td></tr>
          <tr><td style="padding:5px 0;"><b>No. HP:</b></td><td style="padding:5px 0;">${data.nomor_handphone}</td></tr>
          <tr><td style="padding:5px 0;"><b>Alasan Penolakan:</b></td><td style="padding:5px 0;">${data.reason || 'Tidak ada alasan yang diberikan'}</td></tr>
        </table>
      </div>
      <p style="color:#ff9800;font-weight:bold;">💡 Anda dapat mencoba booking ulang dengan waktu yang berbeda.</p>
      <p>Untuk pertanyaan lebih lanjut, silakan hubungi kami di nomor yang tertera.</p>
      <hr style="margin:30px 0;border:none;border-top:1px solid #ddd;">
      <small style="color:#666;">© 2025 Anas Law - Solusi Hukum Terpercaya</small>
    </div>
  `;
}


