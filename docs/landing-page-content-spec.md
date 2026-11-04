# AM2 Landing Page — Content & Information Architecture Specification

**Status:** Draft v0.1  
**Bahasa:** Indonesia dan Inggris  
**Tujuan dokumen:** Menjadi source of truth untuk revisi Figma, penulisan copy, dan implementasi landing page AM2.  
**Catatan:** Nama produk perangkat di dokumen ini masih berupa **working name** sampai nama komersial disetujui.

---

## 1. Keputusan dasar produk

### 1.1 Taxonomy yang digunakan

```text
AM2 — company / product ecosystem
├── Platform: AM² PTT & Command Center
│   ├── AM² PTT — communication domain
│   │   ├── AM2 HT Voice — working name
│   │   └── AM2 HT Video — working name
│   └── AM² Command Center — visual operations domain
│       └── AM2 Body Camera — working name
│
├── Deployment
│   ├── Managed SaaS — server dioperasikan AM2
│   └── On-Premise — server dioperasikan pelanggan
│
└── Services
    ├── Solution discovery
    ├── Deployment and configuration
    ├── Device provisioning
    ├── Training
    └── Software updates and support
```

### 1.2 Status penawaran

| Item | Status komersial | Status bukti | Cara ditampilkan |
|---|---|---|---|
| Platform AM2 | Production | Terverifikasi dari Android client dan backend yang diaudit | `Available` / `Tersedia` |
| AM2 HT Voice | Production | Capability software terverifikasi; spesifikasi OEM belum diberikan | `Available`, dengan catatan spesifikasi model |
| AM2 HT Video | Production | Capability software voice, GPS, dan video terverifikasi; spesifikasi OEM belum diberikan | `Available`, dengan catatan spesifikasi model |
| AM2 Command Center | Production menurut product owner | Repository/platform detail belum tersedia untuk audit | `Available`; hindari detail yang belum dikonfirmasi |
| AM2 Body Camera | Production menurut product owner | Repository dan capability matrix belum tersedia | `Available`; detail recording/evidence wajib dikonfirmasi |
| Managed SaaS | Dapat dijual | Hosted architecture tersedia; SLA dan benchmark belum tersedia | `Available` tanpa angka uptime/setup |
| On-Premise | Dapat dijual | Product-owner confirmed; packaging, sizing, HA, PKI, dan runbook pelanggan masih perlu didokumentasikan | `Available through assessment` |

### 1.3 Status klaim

Setiap klaim harus memiliki salah satu label internal berikut. Label ini tidak semuanya harus tampil di website.

- **`[V] Verified`** — terlihat pada codebase yang diaudit.
- **`[Q] Qualified`** — capability ada, tetapi harus disertai batas atau kondisi.
- **`[O] Owner-confirmed`** — dinyatakan tersedia oleh product owner, tetapi belum diverifikasi dari repository atau evidence.
- **`[T] Test pending`** — perlu benchmark, security test, compatibility test, atau operational evidence.
- **`[R] Roadmap`** — direncanakan, bukan capability production saat ini.
- **`[H] Hold`** — jangan dipublikasikan sebagai klaim sampai tersedia implementasi dan bukti.

---

## 2. Positioning

### 2.1 Kategori produk

**Indonesia**  
Platform komunikasi operasional dan Broadband Push-to-Talk untuk tim lapangan.

**English**  
An operational communications and Broadband Push-to-Talk platform for field teams.

> Gunakan istilah **Push-to-Talk over Cellular (PoC)** hanya setelah ditulis lengkap pada penyebutan pertama. Hindari singkatan `PoC` tanpa konteks karena dapat dibaca sebagai *Proof of Concept*.

### 2.2 Positioning statement internal

**Indonesia**  
Untuk organisasi yang mengoperasikan tim bergerak atau tersebar, AM2 menyediakan perangkat Android dan platform komunikasi terkelola yang menyatukan push-to-talk, posisi unit, video opsional, dan administrasi terpusat. AM2 tersedia melalui Managed SaaS atau deployment on-premise yang dioperasikan pelanggan.

**English**  
For organizations with mobile or distributed teams, AM2 provides Android devices and a managed communications platform that brings together push-to-talk, unit location, optional video, and centralized administration. AM2 is available as Managed SaaS or a customer-operated on-premise deployment.

### 2.3 Target audience

AM2 tidak perlu diposisikan untuk satu industri saja, tetapi tetap harus jelas bahwa produk ini **B2B**, bukan produk konsumen.

**Organisasi:**

- Perusahaan dengan tim lapangan, armada, site, atau operasi multi-lokasi.
- Perusahaan yang sedang mengganti atau melengkapi radio konvensional.
- Organisasi yang membutuhkan pilihan SaaS dan infrastruktur privat.
- System integrator atau channel partner yang memerlukan perangkat + platform.

**Buying committee:**

- Operations manager atau field operations lead.
- IT manager, infrastructure lead, atau security lead.
- Procurement dan finance.
- Business owner atau executive sponsor.
- Supervisor dan administrator operasional.

### 2.4 Message hierarchy

1. **Outcome:** komunikasi tim lapangan lebih cepat dan terkoordinasi.
2. **Capability:** PTT, lokasi, video opsional, dan administrasi terpusat.
3. **Product choice:** tiga pilihan perangkat pada dua platform.
4. **Deployment choice:** Managed SaaS atau customer-operated on-premise.
5. **Trust:** jelaskan kontrol teknis yang nyata, bukan adjective seperti “military-grade”.
6. **Conversion:** demo teknis, konsultasi deployment, atau permintaan proposal.

### 2.5 Hal yang bukan positioning AM2 saat ini

Jangan menggunakan kategori berikut tanpa program engineering dan evidence khusus:

- 3GPP MCPTT/MCVideo/MCData.
- Carrier-grade network.
- Mission-critical certified communications.
- End-to-end encrypted communications.
- Complete fleet management system.
- Evidence-grade body-camera platform.
- Highly available atau multi-region platform.

---

## 3. Arsitektur situs dan bahasa

### 3.1 Struktur MVP

Landing page awal dapat tetap menjadi satu halaman, dengan anchor berikut:

```text
/
├── #platforms
├── #products
├── #capabilities
├── #deployment
├── #security
├── #solutions
├── #pricing
├── #faq
└── #contact
```

### 3.2 Struktur bilingual yang disarankan

Untuk SEO dan link sharing, gunakan URL terpisah sesuai routing aplikasi:

```text
/id/   halaman Indonesia
/      halaman Inggris (default)
```

Tambahkan `hreflang="id"`, `hreflang="en"`, dan `x-default`. Jangan menampilkan dua bahasa sekaligus dalam satu blok visual. Language switcher harus mempertahankan section yang sedang dibuka jika memungkinkan.

Jika MVP harus sangat sederhana, `/` dapat menggunakan bahasa Indonesia dengan toggle ke `/en/`. Jangan memilih bahasa hanya berdasarkan geolocation tanpa memberi pilihan eksplisit.

### 3.3 Halaman lanjutan

```text
/id/platforms/am2-ptt-command-center/
/id/products/am2-ptt/
/id/products/am2-command-center/
/id/deployment/saas/
/id/deployment/on-premise/
/id/security/
/id/resources/
/id/contact/
/id/privacy/
/id/terms/

/en/... equivalent routes
```

Pada MVP, link yang belum memiliki halaman **jangan dirender sebagai link palsu**. Arahkan ke section terkait atau sembunyikan sampai tersedia.

---

## 4. Navigation content

### Indonesia

| Item | Target |
|---|---|
| Platform | `#platforms` |
| Produk | `#products` |
| Deployment | `#deployment` |
| Keamanan | `#security` |
| Solusi | `#solutions` |
| Sumber Daya | `#resources` — tampilkan hanya jika ada material |
| **Jadwalkan Demo** | `#contact` |

### English

| Item | Target |
|---|---|
| Platforms | `#platforms` |
| Products | `#products` |
| Deployment | `#deployment` |
| Security | `#security` |
| Solutions | `#solutions` |
| Resources | `#resources` — render only when material exists |
| **Book a Demo** | `#contact` |

### Mobile navigation

- Logo AM2.
- Language switcher `ID / EN`.
- Menu button dengan accessible label.
- Satu CTA utama.
- Semua item dapat diakses dengan keyboard dan focus state terlihat.

---

## 5. Homepage content specification

Urutan section yang disarankan:

1. Header/navigation.
2. Hero.
3. Factual proof strip.
4. Operational outcomes.
5. Two-platform ecosystem.
6. Three product choices.
7. Verified capabilities.
8. How AM2 works.
9. Deployment and responsibility model.
10. Security and operational controls.
11. Solutions/use cases.
12. Why AM2.
13. Pricing approach.
14. Evidence/resources placeholder.
15. FAQ.
16. Final CTA/contact.
17. Footer.

---

## 5.1 Hero

**Eyebrow — ID**  
`BROADBAND PTT · SAAS · ON-PREMISE`

**Eyebrow — EN**  
`BROADBAND PTT · SAAS · ON-PREMISE`

**H1 — ID**  
`Komunikasi cepat untuk tim lapangan. Kendali yang jelas untuk operasional.`

**H1 — EN**  
`Fast communication for field teams. Clear control for operations.`

**Supporting copy — ID**  
`AM2 menyatukan push-to-talk, posisi unit, video opsional, dan administrasi terpusat melalui perangkat Android—tersedia sebagai Managed SaaS maupun deployment on-premise.`

**Supporting copy — EN**  
`AM2 brings together push-to-talk, unit location, optional video, and centralized administration across Android devices—available as Managed SaaS or an on-premise deployment.`

**Primary CTA — ID**  
`Jadwalkan demo teknis`

**Primary CTA — EN**  
`Book a technical demo`

**Secondary CTA — ID**  
`Lihat pilihan produk`

**Secondary CTA — EN**  
`Explore product options`

**CTA microcopy — ID**  
`Bahas perangkat, jumlah unit, jaringan, dan model deployment bersama tim AM2.`

**CTA microcopy — EN**  
`Discuss devices, fleet size, connectivity, and deployment requirements with the AM2 team.`

**Visual direction:** gunakan foto perangkat OEM asli dan screenshot UI yang telah disamarkan. Hindari stock photo generik sebagai visual utama.

---

## 5.2 Factual proof strip

Section ini menggantikan angka uptime atau latency yang belum tersedia.

### Indonesia

- `2 platform operasional`
- `3 pilihan perangkat`
- `Managed SaaS atau on-premise`
- `Administrasi Web terpusat`

### English

- `2 operational platforms`
- `3 device options`
- `Managed SaaS or on-premise`
- `Centralized Web administration`

**Status:** dua platform dan status production berasal dari konfirmasi product owner `[O]`; capability platform AM2 berasal dari audit `[V]`.

---

## 5.3 Operational outcomes

**Section label — ID:** `UNTUK OPERASI YANG BERGERAK`  
**Section label — EN:** `BUILT FOR MOVING OPERATIONS`

**H2 — ID**  
`Satu alur komunikasi untuk tim yang bekerja di lapangan.`

**H2 — EN**  
`One communication flow for teams working in the field.`

**Intro — ID**  
`Kurangi perpindahan antara panggilan, aplikasi, dan laporan manual. AM2 membantu tim berbicara, melihat status unit, dan mengelola akses dari satu ekosistem.`

**Intro — EN**  
`Reduce the need to switch between calls, apps, and manual updates. AM2 helps teams communicate, view unit status, and manage access from one ecosystem.`

### Outcome card 1

**ID — title:** `Hubungi tim tanpa proses dialing`  
**ID — body:** `Gunakan channel push-to-talk untuk berbicara kepada satu tim, atau komunikasi privat untuk menghubungi satu unit.`

**EN — title:** `Reach teams without dialing`  
**EN — body:** `Use push-to-talk channels to address a team, or private communication to reach an individual unit.`

### Outcome card 2

**ID — title:** `Lihat unit yang aktif`  
**ID — body:** `Pantau status online, pembicara aktif, dan posisi terbaru unit yang tersedia pada platform.`

**EN — title:** `See which units are active`  
**EN — body:** `View online status, active speakers, and the latest available unit location on the platform.`

### Outcome card 3

**ID — title:** `Kelola akses secara terpusat`  
**ID — body:** `Atur user, channel, membership, dan fitur dari WebAdmin sesuai struktur operasional organisasi.`

**EN — title:** `Manage access centrally`  
**EN — body:** `Manage users, channels, memberships, and features from WebAdmin according to your operating structure.`

### Outcome card 4

**ID — title:** `Tambahkan konteks visual saat dibutuhkan`  
**ID — body:** `Gunakan perangkat berkemampuan video atau body camera untuk workflow yang membutuhkan informasi visual.`

**EN — title:** `Add visual context when needed`  
**EN — body:** `Use video-enabled devices or body cameras for workflows that require visual context.`

---

## 5.4 Combined platform page

**Section label — ID:** `EKOSISTEM AM2`  
**Section label — EN:** `THE AM2 ECOSYSTEM`

**H2 — ID**  
`Satu platform operasional. Komunikasi lapangan dan operasi visual.`

**H2 — EN**  
`One operational platform. Field communication and visual operations.`

**Intro — ID**  
`Halaman /platforms/am2-ptt-command-center menyatukan komunikasi lapangan AM² PTT dan AM² Command Center untuk operasi visual. Keduanya ditampilkan sebagai section terpisah agar capability dan perangkatnya tetap jelas, serta dikelola melalui WebAdmin terintegrasi.`

**Intro — EN**  
`The /platforms/am2-ptt-command-center page brings together AM² PTT field communication and AM² Command Center visual operations. They remain separate sections so their capabilities and devices stay clear, and are managed through integrated WebAdmin.`

> **Guardrail:** jangan mengubah kalimat di atas menjadi “complete tenant isolation” atau “dedicated tenant infrastructure” sebelum isolation test dan deployment model membuktikannya.

### Section 01 — AM² PTT

**Badge:** `AVAILABLE / TERSEDIA`  
**Title:** `AM2`  
**Subtitle — ID:** `Platform komunikasi lapangan berbasis Android`  
**Subtitle — EN:** `Android-based field communications platform`

**Body — ID**  
`Menghubungkan channel push-to-talk, komunikasi privat, posisi unit terbaru, video opsional, presence, dan pengelolaan akses untuk tim lapangan.`

**Body — EN**  
`Connects push-to-talk channels, private communication, latest unit location, optional video, presence, and access management for field teams.`

**Capability tags:**

- Channel PTT `[V]`
- Private voice `[V]`
- Private and channel video `[V]`
- Latest location `[V]`
- Presence `[V]`
- Central administration `[V]`

**CTA — ID:** `Lihat perangkat AM² PTT`  
**CTA — EN:** `View AM² PTT devices`

### Section 02 — AM² Command Center

**Badge:** `AVAILABLE / TERSEDIA`  
**Title:** `AM2 Command Center`  
**Subtitle — ID:** `Platform pengawasan dan koordinasi visual`  
**Subtitle — EN:** `Visual monitoring and coordination platform`

**Body — ID**  
`Menghubungkan body camera dan workflow operasional visual ke satu command environment bagi supervisor dan administrator.`

**Body — EN**  
`Connects body cameras and visual operational workflows in one command environment for supervisors and administrators.`

**Capability placeholders yang harus dikonfirmasi sebelum copy final:**

- Live body-camera monitoring `[O — confirm exact behavior]`
- Device status and assignment `[O — confirm]`
- Video recording and playback `[O — confirm storage and retention]`
- Unit location `[O — confirm current/latest/history]`
- Incident or evidence workflow `[H — do not claim tamper evidence yet]`
- Export and audit metadata `[O — confirm]`

**CTA — ID:** `Lihat perangkat AM² Command Center`  
**CTA — EN:** `View AM² Command Center devices`

---

## 5.5 Product choices

**Section label — ID:** `PILIHAN PERANGKAT`  
**Section label — EN:** `DEVICE OPTIONS`

**H2 — ID**  
`Pilih perangkat sesuai konteks kerja tim Anda.`

**H2 — EN**  
`Choose the device that fits how your team works.`

**Intro — ID**  
`AM2 dipasangkan dengan perangkat Android dari mitra OEM terpilih. Spesifikasi akhir menyesuaikan model, kebutuhan operasional, dan jumlah deployment.`

**Intro — EN**  
`AM2 is supplied on selected Android devices from OEM partners. Final specifications depend on the chosen model, operational requirements, and deployment size.`

### Product 01 — AM2 HT Voice (working name)

**Status:** `Available`  
**Platform:** `AM2`

**ID**  
`Perangkat Push-to-Talk over Cellular untuk komunikasi suara berbasis channel, komunikasi privat, dan posisi unit terbaru.`

**EN**  
`A Push-to-Talk over Cellular device for channel voice communication, private communication, and latest unit location.`

**Feature list:**

- Channel PTT `[V]`
- Private voice through AM2 relay `[V]`
- GPS/latest location `[V]`
- Online and speaker presence `[V]`
- Physical, headset, and supported BLE PTT controls `[Q]`
- VOX `[V]`

**CTA — ID:** `Minta spesifikasi HT Voice`  
**CTA — EN:** `Request HT Voice specifications`

### Product 02 — AM2 HT Video (working name)

**Status:** `Available`  
**Platform:** `AM2`

**ID**  
`Perangkat Push-to-Talk over Cellular yang menambahkan live video pada kemampuan voice dan location untuk workflow yang membutuhkan konteks visual.`

**EN**  
`A Push-to-Talk over Cellular device that adds live video to voice and location capabilities for workflows that need visual context.`

**Feature list:**

- Seluruh capability AM2 HT Voice `[V]`
- Channel video `[V]`
- Private video through AM2 relay `[V]`
- Front or rear camera support, depending on OEM model `[Q]`

**CTA — ID:** `Minta spesifikasi HT Video`  
**CTA — EN:** `Request HT Video specifications`

### Product 03 — AM2 Body Camera (working name)

**Status:** `Available — owner-confirmed`  
**Platform:** `AM2 Command Center`

**ID**  
`Perangkat body-worn camera untuk menghadirkan konteks visual dari lapangan ke AM2 Command Center.`

**EN**  
`A body-worn camera that brings visual context from the field into AM2 Command Center.`

**Feature list draft:**

- Live video `[O — confirm]`
- Device and user assignment `[O — confirm]`
- Recording `[O — confirm whether device-side, server-side, or both]`
- Location `[O — confirm cadence and history]`
- Playback and export `[O — confirm]`
- Evidence integrity or tamper detection `[H — do not publish until implemented and tested]`

**CTA — ID:** `Minta spesifikasi Body Camera`  
**CTA — EN:** `Request Body Camera specifications`

### Shared OEM disclosure

**ID**  
`Perangkat menggunakan hardware white-label dari mitra OEM dan dikonfigurasi untuk platform AM2. Dukungan band seluler, Wi-Fi, GNSS, versi Android, kapasitas baterai, rating IP, kamera, aksesori, dan sertifikasi bergantung pada model yang dipilih.`

**EN**  
`Devices use white-label hardware from OEM partners and are configured for the AM2 platform. Cellular bands, Wi-Fi, GNSS, Android version, battery capacity, IP rating, camera, accessories, and certifications depend on the selected model.`

### Product specification placeholders

Jangan mengisi angka perkiraan. Siapkan kolom berikut untuk setiap model:

- OEM/model code.
- Android version dan update policy.
- CPU/RAM/storage.
- Supported cellular bands and SIM configuration.
- Wi-Fi/Bluetooth/GNSS.
- PTT and emergency key mapping.
- Camera specification.
- Battery capacity and tested operating profile.
- Charging/dock/accessories.
- Dimensions and weight.
- IP/MIL certifications.
- Operating temperature.
- Warranty and replacement policy.
- Regulatory certification.
- Tested network/device compatibility.

---

## 5.6 Verified capabilities

**Section label — ID:** `CAPABILITY`  
**Section label — EN:** `CAPABILITIES`

**H2 — ID**  
`Dari tombol PTT hingga visibilitas operasional.`

**H2 — EN**  
`From the PTT button to operational visibility.`

### Capability 1 — Channel Push-to-Talk `[V]`

**ID:** `Berkomunikasi melalui channel yang ditetapkan organisasi, dengan indikator transmisi dan pembicara aktif.`  
**EN:** `Communicate through organization-defined channels with transmission and active-speaker indicators.`

### Capability 2 — Private communication `[V/Q]`

**ID:** `Hubungi unit tertentu melalui sesi voice atau video privat yang dirutekan melalui AM2 relay.`  
**EN:** `Reach a specific unit through private voice or video sessions routed by the AM2 relay.`

> Gunakan “private communication”, bukan “direct peer-to-peer transport”.

### Capability 3 — Latest unit location `[V/Q]`

**ID:** `Lihat posisi terbaru unit online pada peta ketika izin lokasi, perangkat, dan koneksi tersedia.`  
**EN:** `View the latest location of online units on a map when device permissions and connectivity are available.`

> Jangan menyebut route history, trip playback, atau geofence untuk platform AM2 saat ini.

### Capability 4 — Presence `[V]`

**ID:** `Lihat unit online serta indikator speaker dan video aktif pada channel.`  
**EN:** `View online units and active speaker or video indicators within a channel.`

### Capability 5 — Centralized administration `[V/O]`

**ID:** `Kelola user, channel, membership, feature permissions, dan sesi perangkat melalui WebAdmin terintegrasi.`  
**EN:** `Manage users, channels, memberships, feature permissions, and device sessions through integrated WebAdmin.`

### Capability 6 — Configurable field controls `[V/Q]`

**ID:** `Gunakan tombol layar, tombol perangkat, headset/media button, atau aksesori BLE yang telah diuji.`  
**EN:** `Use on-screen controls, device keys, headset/media buttons, or tested BLE accessories.`

### Capability 7 — Foreground operation and reconnect `[V/Q]`

**ID:** `Aplikasi dirancang tetap aktif sebagai Android foreground service dan mencoba tersambung kembali saat koneksi terputus.`  
**EN:** `The app is designed to operate as an Android foreground service and attempt reconnection after connectivity loss.`

> Perilaku aktual bergantung pada Android version, OEM power management, permissions, dan kondisi jaringan.

### Capability 8 — Configurable channel modes `[V/Q]`

**ID:** `Kebijakan receive-only dan mode channel dapat dikonfigurasi sesuai dukungan platform.`  
**EN:** `Receive-only policies and channel modes can be configured according to platform support.`

> Jangan menjanjikan telephony-grade full duplex atau TX-only ACL sampai behavior tersebut diuji end-to-end.

---

## 5.7 How AM2 works

**Section label — ID:** `CARA KERJA`  
**Section label — EN:** `HOW IT WORKS`

**H2 — ID**  
`Perangkat, platform, dan administrator dalam satu alur.`

**H2 — EN**  
`Devices, platform, and administrators in one flow.`

### Step 1

**ID — title:** `Tim menggunakan perangkat AM2`  
**ID — body:** `Perangkat Android terhubung melalui jaringan IP yang tersedia, seperti konektivitas seluler atau Wi-Fi yang kompatibel.`

**EN — title:** `Teams use AM2 devices`  
**EN — body:** `Android devices connect through available IP networks, such as compatible cellular or Wi-Fi connectivity.`

### Step 2

**ID — title:** `Platform merutekan komunikasi dan status`  
**ID — body:** `AM2 menangani session, channel, voice, video, presence, dan update posisi melalui koneksi yang dilindungi TLS.`

**EN — title:** `The platform routes communication and status`  
**EN — body:** `AM2 handles sessions, channels, voice, video, presence, and location updates through TLS-protected connections.`

### Step 3

**ID — title:** `Administrator mengelola operasi`  
**ID — body:** `WebAdmin digunakan untuk mengelola organisasi atau tenant, user, channel, akses, dan konfigurasi fitur.`

**EN — title:** `Administrators manage operations`  
**EN — body:** `WebAdmin is used to manage organizations or tenants, users, channels, access, and feature configuration.`

### Architecture diagram labels

```text
AM2 Devices
    ↓ HTTPS/WSS with TLS
AM2 Platform / AM2 Command Center
    ↓
Integrated WebAdmin

Deployment boundary:
- SaaS: AM2-operated infrastructure
- On-Premise: customer-operated infrastructure
```

Jangan menggambar koneksi media sebagai device-to-device. Media platform AM2 production dirutekan melalui relay.

---

## 5.8 Deployment and responsibility model

**Section label — ID:** `DEPLOYMENT`  
**Section label — EN:** `DEPLOYMENT`

**H2 — ID**  
`Pilih model operasional yang sesuai dengan infrastruktur Anda.`

**H2 — EN**  
`Choose the operating model that fits your infrastructure.`

**Intro — ID**  
`Gunakan Managed SaaS untuk menjalankan platform pada server AM2, atau pilih on-premise untuk mengoperasikannya pada infrastruktur pelanggan.`

**Intro — EN**  
`Use Managed SaaS to run the platform on AM2-operated servers, or choose on-premise to operate it within customer infrastructure.`

### Managed SaaS

**Badge:** `AM2-OPERATED`  
**Title:** `Managed SaaS`

**ID body**  
`AM2 mengoperasikan infrastruktur platform dan menyediakan pembaruan software sesuai service agreement. Pelanggan mengelola pengguna, perangkat, serta konektivitas lapangan.`

**EN body**  
`AM2 operates the platform infrastructure and provides software updates according to the service agreement. The customer manages users, devices, and field connectivity.`

**Suitable for — ID:** `Organisasi yang ingin memulai tanpa mengoperasikan server aplikasi sendiri.`  
**Suitable for — EN:** `Organizations that want to deploy without operating the application servers themselves.`

**CTA — ID:** `Minta proposal SaaS`  
**CTA — EN:** `Request a SaaS proposal`

### On-Premise

**Badge:** `CUSTOMER-OPERATED`  
**Title:** `On-Premise`

**ID body**  
`Platform dijalankan pada infrastruktur pelanggan. Pelanggan mengendalikan server, jaringan, backup, monitoring, dan kebijakan infrastrukturnya; AM2 menyediakan software, panduan implementasi, dan pembaruan produk.`

**EN body**  
`The platform runs on customer infrastructure. The customer controls servers, networking, backups, monitoring, and infrastructure policies; AM2 provides software, implementation guidance, and product updates.`

**Suitable for — ID:** `Organisasi yang memerlukan kontrol infrastruktur, integrasi jaringan privat, atau kebijakan operasional khusus.`  
**Suitable for — EN:** `Organizations that require infrastructure control, private-network integration, or specific operating policies.`

**CTA — ID:** `Konsultasikan arsitektur on-premise`  
**CTA — EN:** `Discuss an on-premise architecture`

### Responsibility matrix

| Responsibility | Managed SaaS | On-Premise |
|---|---|---|
| Application infrastructure | AM2 | Customer |
| Platform software | AM2 | AM2 provides; customer operates |
| Software update package | AM2 | AM2 |
| Update scheduling | AM2 under service policy | Jointly agreed/customer change control |
| Server OS and virtualization | AM2 | Customer |
| Database operations | AM2 under service scope | Customer, with agreed AM2 guidance |
| Network and firewall | Shared responsibility | Customer |
| Backup and restore | AM2 under documented service scope `[T]` | Customer |
| Monitoring | AM2 under documented service scope `[T]` | Customer |
| Field devices and connectivity | Customer | Customer |
| User/channel administration | Customer admin | Customer admin |
| SLA and support hours | `[TBD in agreement]` | `[TBD in agreement]` |

### On-premise discovery checklist

- Target user/device count.
- Concurrent voice/video profile.
- Network topology and firewall.
- DNS, certificate, and PKI requirements.
- Server/VM operating environment.
- Database and Redis operations.
- Backup, restore, RPO, and RTO ownership.
- Monitoring and log retention.
- Update approval and maintenance windows.
- Internet-connected, private-network, or air-gap requirement.
- Remote support method.
- Security assessment requirements.

> `Air-gapped` hanya boleh dipublikasikan setelah dependency, activation, maps, updates, certificate, and support flow dapat bekerja tanpa outbound internet.

---

## 5.9 Services

**Section label — ID:** `SERVICES`  
**Section label — EN:** `SERVICES`

**H2 — ID**  
`Dari pemilihan perangkat hingga platform berjalan.`

**H2 — EN**  
`From device selection to a working deployment.`

### Service cards

1. **Solution discovery**  
   ID: `Pemetaan user, lokasi operasi, jaringan, workflow, dan kebutuhan deployment.`  
   EN: `Assessment of users, operating sites, networks, workflows, and deployment requirements.`

2. **Deployment and configuration**  
   ID: `Konfigurasi platform, organisasi, user, channel, dan hak akses awal.`  
   EN: `Initial configuration of the platform, organizations, users, channels, and access.`

3. **Device provisioning**  
   ID: `Persiapan perangkat OEM yang dipilih, aplikasi, dan tombol atau aksesori yang didukung.`  
   EN: `Preparation of selected OEM devices, applications, and supported controls or accessories.`

4. **Training**  
   ID: `Onboarding untuk administrator, supervisor, dan pengguna lapangan sesuai ruang lingkup proyek.`  
   EN: `Onboarding for administrators, supervisors, and field users according to project scope.`

5. **Updates and support**  
   ID: `Pembaruan software dan dukungan diberikan sesuai paket layanan dan perjanjian komersial.`  
   EN: `Software updates and support are provided according to the selected service package and commercial agreement.`

> Jangan menulis `24/7`, response time, replacement time, atau support SLA sebelum paket dukungan disahkan.

---

## 5.10 Security and operational controls

**Section label — ID:** `SECURITY & CONTROL`  
**Section label — EN:** `SECURITY & CONTROL`

**H2 — ID**  
`Jelaskan keamanan melalui kontrol yang nyata.`

**H2 — EN**  
`Security explained through concrete controls.`

**Intro — ID**  
`AM2 menggunakan kontrol pada koneksi, session perangkat, administrasi, dan release software. Detail keamanan harus mengikuti deployment serta ruang lingkup layanan yang dipilih.`

**Intro — EN**  
`AM2 applies controls to connections, device sessions, administration, and software releases. Security details depend on the selected deployment and service scope.`

### Publishable controls

- `External application connections protected in transit with HTTPS/WSS and TLS.` `[V]`
- `Revocable per-device sessions and remote force logout.` `[V]`
- `Protected device-token storage on supported Android versions.` `[V/Q]`
- `Central user, channel, and feature policies.` `[V]`
- `Controlled build, update, and rollback process.` `[V/Q]`
- `Customer-controlled infrastructure boundary for on-premise deployment.` `[O/Q]`
- `Organization or tenant separation in administrative workflows.` `[O/Q]`

### Indonesian card copy

- **Koneksi:** `Koneksi aplikasi eksternal dilindungi selama transit menggunakan HTTPS/WSS dan TLS.`
- **Session perangkat:** `Session perangkat dapat dicabut dan unit dapat dipaksa logout dari platform.`
- **Kontrol administrasi:** `User, channel, membership, dan feature permissions dikelola secara terpusat.`
- **Software lifecycle:** `Build dan pembaruan aplikasi melewati kontrol integritas serta release process.`
- **On-premise boundary:** `Pelanggan mengendalikan boundary infrastruktur pada deployment on-premise.`

### English card copy

- **Connections:** `External application connections are protected in transit using HTTPS/WSS and TLS.`
- **Device sessions:** `Device sessions can be revoked and units can be remotely signed out of the platform.`
- **Administrative control:** `Users, channels, memberships, and feature permissions are centrally managed.`
- **Software lifecycle:** `Application builds and updates pass through integrity and release controls.`
- **On-premise boundary:** `Customers control the infrastructure boundary in on-premise deployments.`

### Evidence program — internal placeholder

Capability berikut boleh masuk backlog/content inventory, tetapi **bukan badge atau klaim production**:

- Independent security assessment `[T/R]`.
- Penetration test and remediation report `[T/R]`.
- SaaS SLA and support framework `[T/R]`.
- Uptime measurement and public methodology `[T]`.
- Load, concurrency, and soak testing `[T]`.
- High-availability and disaster-recovery architecture `[R]`.
- Supported-device certification matrix `[T]`.
- Formal privacy/data-retention documentation `[R]`.
- ISO 27001/SOC 2 or other certification `[R — only if formally committed]`.

---

## 5.11 Solutions and use cases

**Section label — ID:** `SOLUSI`  
**Section label — EN:** `SOLUTIONS`

**H2 — ID**  
`Untuk organisasi yang bekerja melampaui meja kantor.`

**H2 — EN**  
`For organizations operating beyond the desk.`

**Intro — ID**  
`AM2 dapat dikonfigurasi untuk berbagai tim lapangan tanpa membatasi platform pada satu industri.`

**Intro — EN**  
`AM2 can be configured for different field operations without limiting the platform to a single industry.`

### Use-case cards

| Segment | Indonesia | English |
|---|---|---|
| Logistics & transportation | `Koordinasi pengemudi, dispatcher, hub, dan supervisor melalui channel serta posisi unit terbaru.` | `Coordinate drivers, dispatchers, hubs, and supervisors through channels and latest unit location.` |
| Mining & energy | `Hubungkan tim pada site dan area kerja yang menggunakan konektivitas IP yang sesuai.` | `Connect teams across sites and operating areas using suitable IP connectivity.` |
| Construction | `Koordinasikan supervisor, operator, security, dan tim proyek pada beberapa zona kerja.` | `Coordinate supervisors, operators, security, and project teams across work zones.` |
| Manufacturing & warehousing | `Buat channel untuk produksi, gudang, maintenance, dan respons operasional.` | `Create channels for production, warehousing, maintenance, and operational response.` |
| Security & facilities | `Hubungkan petugas, control room, dan supervisor dengan voice, location, dan video sesuai perangkat.` | `Connect officers, control rooms, and supervisors with voice, location, and device-dependent video.` |
| Government & public operations | `Dukung koordinasi unit lapangan melalui deployment dan kebijakan akses yang disesuaikan.` | `Support field-unit coordination through tailored deployment and access policies.` |

> Gunakan use case sebagai contoh konfigurasi. Jangan mengklaim pelanggan, hasil keselamatan, penghematan, atau regulatory suitability tanpa case study.

---

## 5.12 Why AM2

**Section label:** `WHY AM2`

**H2 — ID**  
`Perangkat dan platform dirancang sebagai satu solusi.`

**H2 — EN**  
`Devices and platforms delivered as one solution.`

### Differentiator 1

**ID — title:** `Pilihan perangkat sesuai workflow`  
**ID — body:** `Pilih HT voice, HT video, atau body camera berdasarkan kebutuhan pengguna dan konteks operasional.`

**EN — title:** `Device choices for different workflows`  
**EN — body:** `Choose a voice handheld, video handheld, or body camera based on user and operational requirements.`

### Differentiator 2

**ID — title:** `Dua platform, administrasi terintegrasi`  
**ID — body:** `Kelola platform AM2 dan AM2 Command Center melalui WebAdmin dengan struktur organisasi atau tenant.`

**EN — title:** `Two platforms, integrated administration`  
**EN — body:** `Manage AM2 and AM2 Command Center through WebAdmin with organization or tenant structures.`

### Differentiator 3

**ID — title:** `SaaS atau on-premise`  
**ID — body:** `Pilih server yang dioperasikan AM2 atau jalankan platform pada infrastruktur pelanggan.`

**EN — title:** `SaaS or on-premise`  
**EN — body:** `Choose AM2-operated servers or run the platform on customer infrastructure.`

### Differentiator 4

**ID — title:** `Solution engineering yang dapat disesuaikan`  
**ID — body:** `Ruang lingkup perangkat, deployment, konfigurasi, dan dukungan ditentukan bersama berdasarkan kebutuhan proyek.`

**EN — title:** `Adaptable solution engineering`  
**EN — body:** `Device, deployment, configuration, and support scope are defined around project requirements.`

**Optional differentiator:** `Developed in Indonesia` hanya ditampilkan setelah nama badan hukum, lokasi, coverage support, dan wording brand disetujui.

---

## 5.13 Pricing approach

**Section label — ID:** `PRICING`  
**Section label — EN:** `PRICING`

**H2 — ID**  
`Harga mengikuti perangkat, skala, dan model deployment.`

**H2 — EN**  
`Pricing follows your devices, scale, and deployment model.`

**Body — ID**  
`Proposal AM2 disusun berdasarkan jenis dan jumlah perangkat, user aktif, fitur, model SaaS atau on-premise, kebutuhan implementasi, serta paket dukungan.`

**Body — EN**  
`AM2 proposals are based on device type and quantity, active users, features, SaaS or on-premise deployment, implementation requirements, and support package.`

### Pricing components

1. `OEM device or device bundle`.
2. `SaaS subscription per active user/device or agreed capacity` — commercial unit must be confirmed.
3. `On-premise platform license` — perpetual/subscription model must be confirmed.
4. `Implementation and integration`.
5. `Training`.
6. `Support and software updates`.
7. `Optional accessories and replacement coverage`.

**CTA — ID:** `Minta proposal`  
**CTA — EN:** `Request a proposal`

### Rule before publishing numbers

Jika harga publik akan ditampilkan, wajib jelaskan:

- Currency and tax.
- Billing period.
- Minimum users/devices.
- Included features.
- Hardware included or excluded.
- Setup/implementation fee.
- Support level.
- Contract period.
- On-premise license and update entitlement.

Sebelum hal tersebut final, gunakan `Contact Sales / Minta Proposal`, bukan angka sementara.

---

## 5.14 Evidence and resources

**Section label — ID:** `TECHNICAL RESOURCES`  
**Section label — EN:** `TECHNICAL RESOURCES`

Section ini hanya dirender ketika setidaknya satu dokumen benar-benar tersedia.

### Resource backlog

- AM2 platform datasheet.
- AM2 Command Center datasheet.
- Device specification sheets.
- Supported devices and accessories matrix.
- SaaS architecture overview.
- On-premise reference architecture.
- Security and privacy brief.
- Deployment responsibility matrix.
- Admin capability overview.
- Test methodology and benchmark report.
- Support and escalation guide.
- Customer case study.

### Evidence placeholders — do not render yet

- `[CUSTOMER_LOGOS]`
- `[DEPLOYED_DEVICE_COUNT]`
- `[ACTIVE_ORGANIZATION_COUNT]`
- `[LATENCY_P50_P95_BY_NETWORK]`
- `[UPTIME_MEASUREMENT_PERIOD]`
- `[MAX_TESTED_CONCURRENT_USERS]`
- `[SUPPORTED_DEVICE_MATRIX_URL]`
- `[SECURITY_ASSESSMENT_DATE]`
- `[CASE_STUDY_URL]`

---

## 5.15 Optional roadmap section

Rekomendasi: simpan roadmap di product conversation atau halaman resources, bukan sebagai blok utama homepage. Jika tetap ingin ditampilkan, gunakan bahasa berikut.

**H2 — ID**  
`Pengembangan berikutnya berfokus pada bukti operasional dan kesiapan enterprise.`

**H2 — EN**  
`Next developments focus on operational evidence and enterprise readiness.`

**ID body**  
`Program pengembangan mencakup pengujian performa dan skala, dokumentasi deployment, service-level framework, security assessment, serta penguatan reliability. Prioritas dan jadwal mengikuti roadmap produk.`

**EN body**  
`The development program covers performance and scale testing, deployment documentation, a service-level framework, security assessment, and reliability improvements. Priorities and timelines follow the product roadmap.`

> Jangan menampilkan tanggal atau label `Coming Soon` tanpa owner, scope, dan target release yang disetujui.

---

## 5.16 FAQ

### FAQ 1

**ID — Q:** `Apa itu Push-to-Talk over Cellular?`  
**ID — A:** `Push-to-Talk over Cellular menggunakan jaringan data IP untuk menghubungkan komunikasi satu-ke-satu atau berbasis channel melalui perangkat yang kompatibel.`

**EN — Q:** `What is Push-to-Talk over Cellular?`  
**EN — A:** `Push-to-Talk over Cellular uses IP data networks to support one-to-one or channel-based communication through compatible devices.`

### FAQ 2

**ID — Q:** `Apa perbedaan AM2 dan AM2 Command Center?`  
**ID — A:** `AM2 berfokus pada komunikasi voice, location, dan video melalui perangkat HT Android. AM2 Command Center berfokus pada body camera dan workflow operasional visual. Keduanya menggunakan administrasi Web yang terintegrasi.`

**EN — Q:** `What is the difference between AM2 and AM2 Command Center?`  
**EN — A:** `AM2 focuses on voice, location, and video communication through Android handhelds. AM2 Command Center focuses on body cameras and visual operational workflows. Both use integrated Web administration.`

### FAQ 3

**ID — Q:** `Apa perbedaan SaaS dan on-premise?`  
**ID — A:** `Pada SaaS, infrastruktur platform dioperasikan AM2. Pada on-premise, platform berjalan pada infrastruktur pelanggan, sementara AM2 menyediakan software, panduan implementasi, dan pembaruan produk sesuai perjanjian.`

**EN — Q:** `What is the difference between SaaS and on-premise?`  
**EN — A:** `With SaaS, AM2 operates the platform infrastructure. With on-premise, the platform runs on customer infrastructure while AM2 provides software, implementation guidance, and product updates according to the agreement.`

### FAQ 4

**ID — Q:** `Apakah AM2 memerlukan jaringan tertentu?`  
**ID — A:** `AM2 memerlukan konektivitas IP yang kompatibel antara perangkat dan platform. Kualitas komunikasi bergantung pada cakupan, bandwidth, latency, perangkat, dan konfigurasi jaringan.`

**EN — Q:** `Does AM2 require a specific network?`  
**EN — A:** `AM2 requires compatible IP connectivity between devices and the platform. Communication quality depends on coverage, bandwidth, latency, devices, and network configuration.`

### FAQ 5

**ID — Q:** `Apakah perangkat dibuat oleh AM2?`  
**ID — A:** `AM2 menggunakan perangkat white-label dari mitra OEM yang dipilih dan dikonfigurasi untuk platform AM2. Spesifikasi dan sertifikasi bergantung pada model yang dipilih.`

**EN — Q:** `Are the devices manufactured by AM2?`  
**EN — A:** `AM2 uses selected white-label devices from OEM partners and configures them for the AM2 platform. Specifications and certifications depend on the selected model.`

### FAQ 6

**ID — Q:** `Apakah komunikasi AM2 terenkripsi?`  
**ID — A:** `Koneksi aplikasi eksternal menggunakan HTTPS/WSS dan TLS untuk melindungi data selama transit. Jangan menyebutnya end-to-end encryption kecuali arsitektur tersebut tersedia dan telah diverifikasi.`

**EN — Q:** `Is AM2 communication encrypted?`  
**EN — A:** `External application connections use HTTPS/WSS and TLS to protect data in transit. This should not be described as end-to-end encryption unless such an architecture is available and verified.`

> Kalimat kedua pada jawaban di atas adalah guardrail internal. Untuk public FAQ, gunakan hanya kalimat pertama ditambah tautan ke security brief ketika tersedia.

### FAQ 7

**ID — Q:** `Bagaimana harga AM2 ditentukan?`  
**ID — A:** `Harga mengikuti jenis dan jumlah perangkat, user atau kapasitas, fitur, model deployment, implementasi, dan paket dukungan. Hubungi tim AM2 untuk proposal.`

**EN — Q:** `How is AM2 priced?`  
**EN — A:** `Pricing depends on device type and quantity, users or capacity, features, deployment model, implementation, and support package. Contact AM2 for a proposal.`

### FAQ 8

**ID — Q:** `Bagaimana cara mencoba AM2?`  
**ID — A:** `Jadwalkan demo teknis dan sampaikan jumlah unit, lokasi operasi, jaringan yang digunakan, serta pilihan SaaS atau on-premise.`

**EN — Q:** `How can I evaluate AM2?`  
**EN — A:** `Book a technical demo and share your expected unit count, operating locations, network environment, and preference for SaaS or on-premise.`

---

## 5.17 Final CTA and contact

**Section label — ID:** `BICARAKAN KEBUTUHAN ANDA`  
**Section label — EN:** `DISCUSS YOUR REQUIREMENTS`

**H2 — ID**  
`Rancang komunikasi lapangan yang sesuai dengan operasi Anda.`

**H2 — EN**  
`Shape a field communications solution around your operation.`

**Body — ID**  
`Ceritakan jumlah unit, wilayah kerja, kebutuhan voice atau video, dan model deployment. Tim AM2 akan membantu menentukan perangkat dan arsitektur awal.`

**Body — EN**  
`Tell us about your unit count, operating areas, voice or video requirements, and deployment preference. The AM2 team will help define an initial device and architecture approach.`

**Primary CTA — ID:** `Jadwalkan demo`  
**Primary CTA — EN:** `Book a demo`

**Secondary CTAs:**

- `WhatsApp Sales / Chat with Sales`
- `Email Sales`
- `Call Sales`
- `Request Pricing / Minta Harga`

### Contact placeholders

- Email: `[SALES_EMAIL]`
- WhatsApp: `[WHATSAPP_NUMBER_E164]`
- Phone: `[SALES_PHONE]`
- Business hours: `[BUSINESS_HOURS_AND_TIMEZONE]`
- Response expectation: `[ONLY PUBLISH IF OPERATIONALLY COMMITTED]`

### Lead form fields

Keep the first form short:

- Full name.
- Work email.
- Phone/WhatsApp.
- Company/organization.
- Role — optional.
- Interested product.
- Deployment preference: SaaS / On-Premise / Not sure.
- Estimated unit count range.
- Message — optional.
- Privacy consent.
- Hidden source/UTM fields.

After submission:

- Show an accessible success state.
- Send confirmation email if mail infrastructure is ready.
- Create or update CRM lead.
- Notify sales by email; WhatsApp notification is optional.
- Never expose SMTP or CRM credentials in browser JavaScript.

---

## 5.18 Footer

### Brand copy

**ID**  
`AM2 menyediakan platform komunikasi operasional berbasis Android untuk tim lapangan, tersedia sebagai Managed SaaS dan on-premise.`

**EN**  
`AM2 provides Android-based operational communications for field teams, available as Managed SaaS and on-premise.`

### Footer groups

**Platforms**

- AM2.
- AM2 Command Center.

**Products**

- AM2 HT Voice.
- AM2 HT Video.
- AM2 Body Camera.

**Deployment**

- Managed SaaS.
- On-Premise.
- Request pricing.

**Company**

- About.
- Contact.
- Support — only if support path exists.
- Resources — only if resources exist.

**Legal**

- Privacy Policy.
- Terms of Use.
- Cookie settings — only if non-essential cookies are used.
- Security contact.

### Required placeholders

- `[LEGAL_COMPANY_NAME]`
- `[REGISTERED_ADDRESS]`
- `[COMPANY_REGISTRATION_INFORMATION_IF_REQUIRED]`
- `[PRIVACY_EMAIL]`
- `[SECURITY_EMAIL]`
- `[COPYRIGHT_YEAR]`

---

## 6. CRM and lead-management recommendation

### 6.1 Decision

**CRM sebaiknya bukan bagian dari customer WebAdmin.**

Pembagian yang disarankan:

- **Landing page:** acquisition interface, form, consent, campaign attribution.
- **CRM:** lead source of truth, pipeline, assignment, follow-up, quotation status.
- **WebAdmin:** customer, tenant, user, channel, device, dan platform operations.

Mencampurkan CRM ke WebAdmin meningkatkan coupling dan memperluas akses data sales ke aplikasi operasional pelanggan. Jika AM2 kelak membuat CRM internal, gunakan service, database, authorization, dan hostname terpisah; tampilannya boleh memakai design system yang sama.

### 6.2 Recommended flow

```text
Visitor
  ↓
Landing-page contact form
  ↓ server-side validation, rate limit, anti-spam, consent
Lead API / integration service
  ├── CRM
  ├── Sales email notification
  └── Optional WhatsApp notification
```

### 6.3 Phased rollout

**Phase 0 — immediate**

- Email link.
- WhatsApp deep link.
- Click-to-call.
- No claim that messages are answered within a fixed time.

**Phase 1 — lead form**

- Server-side form endpoint.
- Minimal data collection.
- Privacy notice and consent.
- Spam protection.
- Email notification plus secure lead storage.

**Phase 2 — CRM integration**

Evaluate an external CRM such as HubSpot, Zoho, Odoo, or another platform based on:

- Indonesia and WhatsApp workflow support.
- API/webhook capability.
- Data hosting and privacy requirements.
- Role and pipeline support.
- Quotation and sales reporting.
- Cost per sales user.
- Export/exit capability.

This document does not select a vendor. The landing page must communicate with the CRM through a server-side integration; never embed private API keys in client code.

### 6.4 Lead pipeline draft

```text
New lead
→ Qualified
→ Technical discovery
→ Demo scheduled
→ Solution design
→ Proposal sent
→ Pilot / evaluation
→ Negotiation
→ Won / Lost
```

Recommended routing tags:

- Product: HT Voice / HT Video / Body Camera / Multi-product.
- Deployment: SaaS / On-Premise / Undecided.
- Source: Organic / Campaign / Partner / Event / Direct.
- Unit range.
- Industry.
- Territory.

---

## 7. Claims register

| Claim | Status | Public wording | Prohibited expansion |
|---|---|---|---|
| Channel PTT | `[V]` | `Push-to-talk berbasis channel` | `3GPP MCPTT` |
| Private voice | `[V/Q]` | `Private voice through AM2 relay` | `Direct peer-to-peer voice` |
| Private/channel video | `[V/Q]` | `Live video through AM2 relay` | `HD conferencing`, `WebRTC`, `direct P2P` |
| Voice codec | `[V]` | `Opus-encoded voice` on technical page | Unmeasured quality/latency guarantees |
| Low latency | `[T]` | `Designed for responsive PTT` if needed | `Sub-500 ms`, `sub-second guaranteed` |
| Latest location | `[V/Q]` | `Latest available unit location` | `Location history`, `geofence`, `route replay` |
| Presence | `[V]` | `Online and active-speaker status` | Workforce analytics |
| VOX | `[V/Q]` | `Configurable voice activation` | Hands-free guarantee on every OEM device |
| Hardware/BLE controls | `[V/Q]` | `Supported and tested controls/accessories` | Universal accessory compatibility |
| Full duplex mode | `[Q/T]` | `Configurable channel mode` | Telephony-grade full-duplex guarantee |
| Background operation | `[V/Q]` | `Android foreground operation` | `Always on` or unaffected by every OEM policy |
| Reconnect | `[V/Q]` | `Automatic reconnection attempts` | Offline communication or zero interruption |
| TLS | `[V]` | `Protected in transit with TLS` | End-to-end encryption |
| Token storage | `[V/Q]` | `Protected token storage on supported Android versions` | Full device encryption claim |
| Central admin | `[V]` | `Manage users, channels, access, and sessions` | Full MDM or remote device wipe |
| Tenant/admin separation | `[O/Q/T]` | `Organization or tenant separation in administration` | Complete tenant/data/infrastructure isolation |
| Operational logs | `[V/Q]` | `Operational activity metadata` | Immutable compliance audit trail |
| Media recording on AM2 platform | `[H]` | Do not publish | Replay, archive, transcription |
| Body-camera recording | `[O/T]` | Publish only after exact storage/retention confirmation | Tamper-evident or evidence-grade recording |
| AM2 Command Center | `[O]` | `Available visual operations platform` | Unverified detailed feature list |
| SaaS | `[O/V]` | `AM2-operated infrastructure` | Uptime/SLA without agreement and evidence |
| On-premise | `[O/Q]` | `Customer-operated deployment with AM2 software and updates` | Turnkey, identical to SaaS, HA, or air-gap by default |
| Setup time | `[T]` | `Deployment plan follows scope` | `<24 hours` or fixed time guarantee |
| Uptime | `[T/R]` | Omit until measured and contracted | `99.9%`, `99.99%` |
| Server redundancy/HA | `[R/H]` | Omit from current platform claims | Active-active, automatic failover, multi-region |
| Backup/DR | `[T/R]` | Define responsibility in agreement | Guaranteed RPO/RTO |
| Security certification | `[R/H]` | Omit badges until certified | ISO/SOC/compliance claim |
| Offline PTT | `[H]` | Do not publish | Communication without network/relay |
| Satellite connectivity | `[T/H]` | `IP connectivity subject to validation` | Native satellite support |
| SOS/man-down | `[H]` | Do not publish unless implemented | Emergency workflow or priority/preemption |
| Messaging/files | `[H]` | Do not publish for current platform | Zello/WalkieFleet feature parity |
| DMR/LMR integration | `[H]` | Do not publish | Radio gateway/interoperability |
| White-label OEM devices | `[O]` | Transparently disclose OEM model dependency | Claim AM2 manufactures the hardware |

---

## 8. Content backlog for currently missing capabilities

The user requested that missing items remain visible for future revision. They are recorded here rather than presented as production features.

### Performance and reliability

- Define PTT latency methodology: button press to first received audio and mouth-to-ear.
- Test p50/p95/p99 on Wi-Fi, LTE, 5G, congestion, and handover.
- Test concurrent connections, channel sizes, voice talkers, and video streams.
- Run soak, restart, reconnect, and database/Redis failure scenarios.
- Define SaaS uptime measurement and exclusions.
- Design and test HA, backup, restore, and DR.

### Security and enterprise readiness

- Perform threat model and external security assessment.
- Resolve and test tenant isolation boundaries.
- Define encryption terminology and key management.
- Document data retention, deletion, location privacy, and subprocessors.
- Define vulnerability management and incident response.
- Decide MFA/SSO requirements.
- Create security brief and customer questionnaire response pack.
- Establish certification roadmap only after business commitment.

### On-premise productization

- Supported OS/hypervisor/hardware matrix.
- Capacity and sizing guide.
- Installer or deployment automation.
- Customer PKI and certificate guide.
- Offline/air-gap dependency analysis.
- Backup/restore runbook.
- Upgrade and rollback process.
- Monitoring and log integration.
- Support boundary and remote-access procedure.
- License activation and renewal model.

### Device evidence

- Model-specific datasheets.
- Indonesian and target-market regulatory documents.
- IP/MIL certificates.
- Battery test methodology.
- Camera and GPS behavior.
- BLE/headset/accessory compatibility matrix.
- Android/OEM background-operation acceptance tests.
- Warranty, replacement, and spare-unit process.

### Command Center evidence

- Current architecture and repository inventory.
- Live monitoring behavior.
- Recording location and format.
- Retention and deletion policy.
- Playback/export.
- Device/user assignment.
- Location current/history semantics.
- Multi-tenant data boundaries.
- Evidence integrity/tamper model.
- Search, audit, and role permissions.
- Capacity and storage sizing.

---

## 9. Competitive benchmark — internal only

Do not place competitor names on the public homepage unless AM2 later creates a reviewed comparison page with reproducible evidence.

### Zello pattern to learn from

- Separates software, hardware, network, integration, and radio interoperability.
- Uses dedicated pages for dispatch, enterprise security, industries, and pricing.
- Supports claims with published scale, uptime history, certification, and product documentation.
- Explains user workflows and outcomes rather than only listing protocols.

**AM2 response:** adopt the information structure and evidence discipline, not Zello’s feature or certification claims.

### WalkieFleet pattern to learn from

WalkieFleet’s official homepage groups its offer around voice/video PTT, messaging, location, OTA configuration, redundancy, custom dispatch consoles, flexible licensing, and device breadth. It also presents a Windows dispatcher for PoC and DMR environments.

**AM2 response:**

- Clearly separate products, platforms, deployment, and services.
- Show the actual AM2 device lineup.
- Make integrated WebAdmin a visible part of the solution.
- Explain SaaS and customer-operated on-premise responsibilities.
- Do not imply current parity for messaging, file transfer, DMR/LMR integration, server redundancy, iOS, OTA fleet programming, or custom dispatch consoles.

### Potential AM2 differentiation to validate

- Device + software + deployment packaged through one commercial conversation.
- Choice between Managed SaaS and customer-operated on-premise.
- Two operational platforms under integrated administration.
- Ability to select OEM hardware according to project requirements.
- Indonesia-based solution engineering and support `[confirm exact coverage]`.

---

## 10. Mapping to the current Figma structure

| Current Figma section | Action | Revised role |
|---|---|---|
| Nav | Keep visual direction; remove links to unavailable pages | Anchor navigation + language + demo CTA |
| Hero | Keep general composition; replace overbroad copy | Precise category, outcome, and demo CTA |
| Platform Overview | Rewrite | Operational outcomes and factual capabilities |
| Three Products | Restructure | Two platform cards followed by three device cards |
| Deployment | Keep two-column concept; rewrite claims | Managed SaaS vs customer-operated on-premise |
| Why AM2 | Rewrite | Device choice, integrated admin, deployment choice, solution engineering |
| Final CTA | Keep | Demo, proposal, WhatsApp, email, phone, form |
| Footer | Keep design; render only real links | Product/deployment/company/legal/contact |

### Claims to remove from Figma now

- Sub-second or sub-500 ms latency.
- Replay-capable voice.
- AES-256 end-to-end encryption.
- Direct/P2P media transport.
- Recording on the audited AM2 platform.
- Tamper-evident body-camera evidence.
- Zero-downtime automatic updates.
- Scaling without infrastructure changes.
- `<24h setup`.
- `99.9% uptime`.
- Air-gap/no outbound dependencies.
- Offline PTT.
- Mission-critical label.
- Regulatory/compliance suitability.

### Visual content additions

- Status badges: `Available`, `Validation in progress`, `Planned` only where applicable.
- Real OEM device images.
- Sanitized Android UI screenshots.
- Sanitized WebAdmin screenshot.
- AM2 Command Center screenshot.
- Simple architecture diagram.
- Product comparison table.
- Deployment responsibility matrix.
- FAQ and contact form.

---

## 11. Writing and design rules

### Copy rules

- One H1 only.
- Heading ideally 4–10 words.
- Paragraph ideally 20–45 words.
- Lead with user outcome, follow with capability and evidence.
- Expand acronyms on first use.
- Use `latest location`, not `location history`.
- Use `private communication through AM2 relay`, not `direct P2P`.
- Use `protected in transit with TLS`, not `E2EE`.
- Use `customer-operated on-premise`, not `identical deployment`.
- Never publish an unsupported number as placeholder copy.

### Status display rules

- `Available` means commercially orderable now.
- `Pilot` means controlled customer evaluation.
- `In development` means not orderable as production.
- `Planned` means no committed release date unless stated.
- `Under validation` means available behavior is being measured, not that a result is guaranteed.

### Visual rules

- Retain dark navy, yellow for AM2, and blue for AM2 Command Center if brand approves.
- Use 16–18 px minimum body copy for primary reading text.
- Do not use 8–9 px labels for essential information.
- Replace fixed Figma coordinates with normal-flow responsive layout.
- Create desktop, tablet, and mobile variants.
- Use product/UI visuals as evidence, not decoration only.
- Ensure every icon has an accessible name or is hidden as decorative.
- Provide visible keyboard focus and reduced-motion behavior.

---

## 12. SEO metadata draft

### Indonesia

**Title**  
`AM2 | Push-to-Talk, Lokasi, dan Video untuk Operasi Lapangan`

**Meta description**  
`Platform komunikasi operasional berbasis Android dengan push-to-talk, lokasi unit, video opsional, dan WebAdmin. Tersedia sebagai SaaS dan on-premise.`

**Suggested H1**  
`Komunikasi cepat untuk tim lapangan. Kendali yang jelas untuk operasional.`

### English

**Title**  
`AM2 | Push-to-Talk, Location, and Video for Field Operations`

**Meta description**  
`Android-based operational communications with push-to-talk, unit location, optional video, and Web administration. Available as SaaS or on-premise.`

**Suggested H1**  
`Fast communication for field teams. Clear control for operations.`

### Structured data

Initially use only factual schemas:

- `Organization` after legal name, address, logo, URL, and contact are confirmed.
- `Product` for each commercial device after model, offer, availability, and brand details are confirmed.
- `FAQPage` only for FAQs visibly rendered on the page.
- Do not add aggregate ratings, reviews, price, or certifications without real source data.

---

## 13. Technical quality baseline for implementation

- Semantic HTML and progressive enhancement.
- WCAG 2.2 AA target.
- Responsive from 320 px upward without horizontal overflow.
- Keyboard-operable navigation and forms.
- Core Web Vitals field targets at p75: LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1.
- Optimized AVIF/WebP images with dimensions and responsive `srcset`.
- Self-host fonts where practical, or use a system-font fallback.
- Minimal JavaScript; no framework required for the first landing page.
- HTTPS, Content Security Policy, HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, and frame protection.
- Canonical URL, sitemap, robots, Open Graph, social image, favicon, and language alternates.
- Privacy-conscious analytics only after event and consent requirements are defined.
- Server-side form handling, validation, rate limiting, anti-spam, and secret management.

---

## 14. Required assets and decisions

### Brand

- Final AM2 logo SVG.
- Brand usage and minimum-size rules.
- Approved colors.
- Legal company name.
- Indonesia/English brand voice.

### Product

- Final commercial names for all three devices.
- OEM model mapping.
- Front/back/side product photos.
- Final capability matrix per device.
- Warranty and certification data.
- AM2 and Command Center screenshots.

### Commercial

- SaaS pricing unit.
- On-premise license model.
- Support packages and hours.
- Update entitlement.
- Trial/demo/pilot policy.
- Sales contact details.

### Technical/trust

- On-premise reference architecture.
- SaaS responsibility and service scope.
- Privacy and retention policy.
- Security contact.
- Test plan and evidence publication policy.

### Legal

- Privacy Policy.
- Terms of Use.
- Cookie/analytics policy.
- OEM photography and trademark permissions.
- Customer logo/testimonial permission.

---

## 15. Recommended delivery phases

### Phase A — content-ready MVP

- Bilingual single-page landing page.
- Hero, outcomes, platforms, products, capabilities, deployment, security, use cases, pricing approach, FAQ, and CTA.
- Email, WhatsApp, and phone CTAs.
- Privacy and terms placeholders resolved before public launch.
- No unsupported metrics or certification badges.

### Phase B — conversion and evidence

- Server-side lead form.
- CRM integration.
- Device datasheets.
- Security brief.
- Product demo assets.
- Product-specific pages.
- On-premise architecture page.

### Phase C — enterprise proof

- Case studies.
- Tested compatibility matrix.
- Published benchmark methodology/results.
- SLA/support pages.
- Status page if operationally supported.
- Security assessment and certification material.

---

## 16. Pre-publication checklist

### Content

- [ ] Final names for three devices approved.
- [ ] Command Center capability list confirmed.
- [ ] Every claim has `[V]`, `[Q]`, `[O]`, `[T]`, `[R]`, or `[H]` owner internally.
- [ ] No hold claim is written as current capability.
- [ ] Indonesia and English copy convey the same meaning.
- [ ] No fake links, metrics, logos, testimonials, or prices.

### Product and technical

- [ ] OEM model specifications attached.
- [ ] SaaS/on-premise responsibility matrix approved.
- [ ] Contact route tested.
- [ ] Security wording approved by technical owner.
- [ ] Screenshots contain no credentials, coordinates, customer data, or internal endpoints.

### Legal and privacy

- [ ] Legal entity and address confirmed.
- [ ] Privacy Policy available.
- [ ] Form consent text approved.
- [ ] Analytics/cookie behavior documented.
- [ ] OEM and customer asset permissions recorded.

### Web quality

- [ ] WCAG keyboard, focus, zoom, contrast, and screen-reader checks.
- [ ] Responsive checks on phone, tablet, laptop, and wide desktop.
- [ ] HTML validation.
- [ ] Lighthouse and field-performance instrumentation.
- [ ] Security headers verified on deployed host.
- [ ] SEO metadata, canonical, hreflang, sitemap, and social preview verified.

---

## 17. Source notes

The structure was informed by the audited AM2 Android/backend codebases, the supplied Figma mockup, and public competitor/standards references:

- [Zello homepage](https://zello.com/) — separates hardware, network, integrations, and radio ecosystem.
- [Zello Work overview](https://support.zello.com/zw/overview-of-zello-work) — demonstrates how a mature vendor supports scale, deployment, security, and product claims with published evidence.
- [Zello Dispatch Hub](https://zello.com/product/dispatch-hub) — organizes content around dispatcher workflows and measurable operational jobs.
- [WalkieFleet](https://walkiefleet.com/) — presents concrete PTT, dispatcher, device, licensing, and infrastructure categories.
- [3GPP SA6 Mission Critical standardization overview](https://www.3gpp.org/ftp/information/presentations/Presentations_2024/04_SA6_past-present-future_v20.pdf) — basis for keeping standard MCPTT terminology separate from proprietary Broadband PTT.
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/) — accessibility baseline.
- [Web Vitals](https://web.dev/web-vitals) — performance metrics and thresholds.
- [OWASP Secure Headers Project](https://owasp.org/projects/secure-headers-project) — HTTP response-header guidance.

Content based on public references was paraphrased for compliance with licensing restrictions.
