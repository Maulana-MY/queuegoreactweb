# Pemisahan Arsitektur dan Logika Fitur Antrean

Dokumen ini memuat rencana untuk memisahkan fitur antrean antara aplikasi User (berbasis Flutter) dan aplikasi Operator (berbasis React), dengan tetap menggunakan skema database (Go/GORM) yang sudah ada.

## User Review Required
> [!IMPORTANT]
> **Manajemen State & Real-time**: 
> 1. Untuk Flutter, apakah Anda ingin menggunakan *Provider*, *GetX*, atau *BLoC*? (Draft akan menggunakan Provider/GetX sebagai default jika tidak ditentukan).
> 2. Untuk React, apakah Anda ingin menggunakan *Redux*, *Zustand*, atau *React Context* biasa?
> 3. Real-time updates (monitoring status antrean): Apakah kita akan menggunakan **WebSockets/Socket.io** yang perlu diimplementasikan di backend Go, atau sekadar **Long Polling / Polling interval** dari frontend?

## Skema Database Saat Ini (Sebagai Acuan)
Skema di backend (`models/queue.go` dan `models/counter.go`) sudah memadai:
- **Queue**: `id`, `counter_id`, `queue_number`, `customer_name`, `status`, `created_at`, `called_at`, `completed_at`
- **Counter**: `id`, `name`, `is_active`

Status antrean yang akan digunakan dalam logika:
- `waiting` : Menunggu dipanggil
- `called` : Sedang dipanggil ke loket (Counter)
- `skipped` : Dilewati
- `completed` : Selesai

## Proposed Architecture & Folder Structure

---

### 1. Backend (Go - `queuego-backend`)
Walaupun fokus pada Frontend, kita perlu memastikan routing di backend mendukung kedua aplikasi tersebut.
- **User API (Flutter)**:
  - `POST /api/user/queue`: Daftar antrean baru
  - `GET /api/user/queue/status`: Cek status antrean saat ini
- **Operator API (React)**:
  - `GET /api/operator/queues`: Ambil daftar antrean
  - `PUT /api/operator/queue/:id/call`: Panggil antrean (set status `called`)
  - `PUT /api/operator/queue/:id/skip`: Lewati antrean (set status `skipped`)
  - `PUT /api/operator/queue/:id/complete`: Selesaikan antrean (set status `completed`)

---

### 2. Frontend Operator (React - `queuegoreact`)
**Fokus**: Dashboard operator untuk memanggil antrean, lewati, selesaikan, dan memonitor antrean masuk.

**Struktur Folder yang Diusulkan**:
```text
queuegoreact/
├── src/
│   ├── api/
│   │   └── queueService.js       # Konfigurasi axios & endpoint API
│   ├── components/
│   │   ├── QueueCard.jsx         # Card untuk menampilkan detail antrean
│   │   ├── ControlPanel.jsx      # Tombol aksi (Call, Skip, Complete)
│   │   └── Sidebar.jsx           # Navigasi operator
│   ├── pages/
│   │   ├── Dashboard.jsx         # Halaman utama Operator
│   │   └── Login.jsx             # Autentikasi Operator
│   ├── store/                    # State management (Context/Zustand)
│   │   └── useQueueStore.js 
│   ├── App.jsx
│   └── index.css
```

**Draf Logika Pemanggilan (React)**:
```javascript
// src/api/queueService.js
import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:8080/api/operator' });

export const fetchQueues = () => API.get('/queues');
export const callQueue = (id) => API.put(`/queue/${id}/call`);
export const skipQueue = (id) => API.put(`/queue/${id}/skip`);
export const completeQueue = (id) => API.put(`/queue/${id}/complete`);
```

---

### 3. Frontend User (Flutter - `queue_go`)
**Fokus**: Layar untuk pendaftaran antrean, mendapatkan tiket/nomor antrean, dan memantau status secara realtime.

**Struktur Folder yang Diusulkan (berbasis fitur)**:
```text
queue_go/
├── lib/
│   ├── core/
│   │   ├── api_client.dart       # Konfigurasi HTTP / Dio
│   │   └── constants.dart        # URL, Colors, dll.
│   ├── models/
│   │   └── queue_model.dart      # Sesuai dengan respons struct Queue Go
│   ├── screens/
│   │   ├── home_screen.dart      # Halaman utama (Daftar Antrean)
│   │   ├── ticket_screen.dart    # Menampilkan nomor tiket & QR/Barcode
│   │   └── monitor_screen.dart   # Menampilkan status realtime antrean
│   ├── services/
│   │   └── queue_service.dart    # API Calls (Daftar, Cek Status)
│   └── main.dart
```

**Draf Logika Pendaftaran (Flutter)**:
```dart
// lib/services/queue_service.dart
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../models/queue_model.dart';

class QueueService {
  final String baseUrl = "http://YOUR_BACKEND_IP:8080/api/user";

  Future<QueueModel?> registerQueue(String customerName) async {
    final response = await http.post(
      Uri.parse('$baseUrl/queue'),
      body: jsonEncode({"customer_name": customerName}),
      headers: {"Content-Type": "application/json"},
    );
    if (response.statusCode == 200 || response.statusCode == 201) {
      return QueueModel.fromJson(jsonDecode(response.body));
    }
    return null;
  }
}
```

## Verification Plan
1. **Setup Awal**: Saya akan mengenerate file-file inti (seperti service dan store) untuk React dan Flutter sesuai persetujuan.
2. **Review Backend**: Kita akan meninjau dan menambahkan controller/routes di `queuego-backend` jika endpoint belum terpisah seperti rancangan di atas.
3. **Pengujian**: Setelah struktur dasar terbentuk, kita akan mencoba melakukan 1 alur penuh: 
   - User mendaftar via Flutter.
   - Operator melihat data di React, kemudian menekan tombol "Call".
   - Aplikasi Flutter User mendapatkan pembaruan status menjadi "Sedang Dipanggil".
