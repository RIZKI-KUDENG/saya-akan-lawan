# Saya Akan Lawan 🔥

Ekstensi VS Code yang memainkan file **lawan.mp3** setiap kali ada error diagnostik (syntax error, compile error, dll) di workspace kamu. Cocok buat temen-temen yang butuh *mood booster* atau pengingat buat terus lawan error!

## Fitur

- Mendeteksi error diagnostik secara otomatis
- Memutar audio `media/lawan.mp3` saat error muncul
- *Debounce* 1,5 detik agar tidak kebanyakan bunyi
- Otomatis berhenti saat semua error hilang
- Bisa diaktifkan/nonaktifkan lewat pengaturan

## Pengaturan

Ekstensi ini menambahkan satu pengaturan:

| ID | Default | Deskripsi |
|---|---|---|
| `sayaAkanLawan.enabled` | `true` | Aktifkan/nonaktifkan pemutaran audio saat ada error |

Cara ubah: `Ctrl/Cmd + Shift + P` → `Preferences: Open Settings (UI)` → cari "Saya Akan Lawan".

## Persyaratan

Tidak ada dependensi tambahan. Ekstensi menggunakan `play-sound` yang sudah dibundle.

## Rilis

### 0.0.1

- Rilis perdana.
