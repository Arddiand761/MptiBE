// server/utils/emailTemplates.js
export function bookingApprovalTemplate(data) {
  return `
    <div style="font-family:sans-serif;max-width:600px;margin:auto;border:1px solid #eee;padding:24px;">
      <img src="https://anascorp.com/logo.png" alt="Anas Law" style="height:48px;">
      <h2>Booking Disetujui</h2>
      <p>Halo <b>${data.nama_pembooking}</b>,</p>
      <p>Booking Anda telah <b>disetujui</b> oleh ${data.lawyer_name}.</p>
      <ul>
        <li><b>ID Booking:</b> ${data.booking_id}</li>
        <li><b>Lawyer:</b> ${data.lawyer_name}</li>
        <li><b>Spesialisasi:</b> ${data.specialty}</li>
        <li><b>Tanggal:</b> ${data.tanggal_booking}</li>
        <li><b>Waktu:</b> ${data.waktu_booking}</li>
        <li><b>No. HP:</b> ${data.nomor_handphone}</li>
      </ul>
      <p>Silakan hadir sesuai jadwal. Hubungi kami jika ada pertanyaan.</p>
      <hr>
      <small>© 2025 Anas Law</small>
    </div>
  `;
}

export function bookingRejectionTemplate(data) {
  return `
    <div style="font-family:sans-serif;max-width:600px;margin:auto;border:1px solid #eee;padding:24px;">
      <img src="https://anascorp.com/logo.png" alt="Anas Law" style="height:48px;">
      <h2>Booking Ditolak</h2>
      <p>Halo <b>${data.nama_pembooking}</b>,</p>
      <p>Mohon maaf, booking Anda <b>ditolak</b> oleh ${data.lawyer_name}.</p>
      <ul>
        <li><b>ID Booking:</b> ${data.booking_id}</li>
        <li><b>Lawyer:</b> ${data.lawyer_name}</li>
        <li><b>Spesialisasi:</b> ${data.specialty}</li>
        <li><b>Tanggal:</b> ${data.tanggal_booking}</li>
        <li><b>Waktu:</b> ${data.waktu_booking}</li>
        <li><b>No. HP:</b> ${data.nomor_handphone}</li>
        <li><b>Alasan Penolakan:</b> ${data.reason || '-'} </li>
      </ul>
      <p>Silakan booking ulang atau hubungi kami untuk pertanyaan lebih lanjut.</p>
      <hr>
      <small>© 2025 Anas Law</small>
    </div>
  `;
}


