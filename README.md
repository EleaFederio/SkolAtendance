# CFNHS Student Attendance System

A student attendance monitoring system for CFNHS (Calabarzon Faith National High School) built with Laravel 13, React 19, Inertia.js, and Tailwind CSS.

## Features

- **Student Records CRUD** — Add, edit, delete, view students with profile pictures
- **CSV Import** — Bulk import students from CSV files
- **QR Code Assignment** — Assign unique QR codes to each student
- **QR Code Scanning** — Scan student QR codes via phone camera or USB QR scanner
- **Attendance Tracking** — Automatic in/out toggling when scanning
- **Monitor Display** — Public display showing today's activity, stats, and media
- **Dashboard** — Overview with on-site students table and live stats
- **Role-Based Access** — Super-user (full access) and Teacher (view-only)
- **Display Config** — Customize monitor display settings (welcome message, clock, stats, media, refresh interval)

## Requirements

- PHP 8.3+
- Node.js 18+
- Composer
- MySQL or SQLite

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd SkolAtendance
```

### 2. Install PHP dependencies

```bash
composer install
```

### 3. Install Node.js dependencies

```bash
npm install
```

### 4. Environment setup

```bash
cp .env.example .env
php artisan key:generate
```

Edit `.env` and configure your database:

```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=skol_atendance
DB_USERNAME=root
DB_PASSWORD=
```

### 5. Run migrations

```bash
php artisan migrate
```

### 6. Create storage link

```bash
php artisan storage:link
```

### 7. Build frontend assets

```bash
npm run build
```

For development:

```bash
npm run dev
```

### 8. Start the server

```bash
php artisan serve
```

The app will be available at `http://localhost:8000`.

## First User

The first registered user automatically becomes the **super-user** with full access to all features. Subsequent users will be registered as teachers (view-only access).

## QR Code Scanner Setup

### Option 1: Scan via Phone (HTTPS Required)

Camera access requires HTTPS. You need `mkcert` to generate a trusted local certificate:

```bash
# Install mkcert (Windows)
winget install FiloSottile.Mkcert

# Create local CA
mkcert -install

# Generate certificate for your local network IP
mkcert 192.168.0.101 localhost 127.0.0.1
```

Laravel's `artisan serve` does not support HTTPS. Use PHP's built-in server with SSL:

```bash
php -S 192.168.0.101:8443 router.php --ssl "192.168.0.101+2.pem" "192.168.0.101+2-key.pem"
```

Then access `https://192.168.0.101:8443` on your phone. Accept the security warning by tapping "Advanced" → "Proceed".

### Option 2: USB QR Scanner

Connect a USB QR scanner (acts as keyboard input) to the computer. Go to **Device Config** → enable **USB QR Scanner** toggle, then scan student QR codes directly.

### Option 3: Android APK (Capacitor)

Build a native Android app for QR scanning — no HTTPS required, works offline.

**Prerequisites:** [Android Studio](https://developer.android.com/studio)

```bash
# Install Capacitor dependencies
npm install @capacitor/core @capacitor/cli @capacitor/android

# Build the web assets
npm run build

# Copy mobile HTML as entry point
cp public/build/resources/mobile/index.html public/build/index.html

# Add Android platform and sync
npx cap sync android

# Open in Android Studio
npx cap open android
```

In Android Studio:
1. Wait for Gradle sync to finish
2. Click **Build → Build Bundle(s) / APK(s) → Build APK(s)**
3. The APK will be at `android/app/build/outputs/apk/debug/app-debug.apk`

**First launch:** Enter your server URL (e.g., `http://192.168.0.101:8000`) when prompted. The app remembers it for next time.

## Project Structure

```
├── app/
│   ├── Enums/Role.php                    # User roles (SUPER_USER, TEACHER)
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── DashboardController.php   # Dashboard with stats
│   │   │   ├── DisplayConfigController.php # Display settings
│   │   │   ├── MonitorController.php     # Monitor display, scan, check-in API
│   │   │   └── StudentController.php     # Student CRUD, import, QR assign
│   │   └── Middleware/EnsureRole.php      # Role-based access control
│   └── Models/
│       ├── Attendance.php                 # Attendance records
│       ├── DisplaySetting.php             # Display configuration
│       └── Student.php                    # Student model
├── database/migrations/                   # Database migrations
├── resources/js/
│   ├── pages/
│   │   ├── dashboard.tsx                  # Dashboard with on-site students table
│   │   ├── display-config/index.tsx       # Display configuration page
│   │   ├── device-config/index.tsx        # Device config (phone scan + USB scanner)
│   │   ├── monitor-display.tsx            # Public monitor display
│   │   ├── scan-attendance.tsx            # Mobile QR scanner page
│   │   └── students/records.tsx           # Student records management
│   └── components/                        # Reusable UI components
└── routes/web.php                         # Application routes
```

## Key Routes

| Route | Description | Auth Required |
|-------|-------------|---------------|
| `/` | Welcome page | No |
| `/{team}/dashboard` | Dashboard | Yes |
| `/{team}/students/records` | Student records | Yes |
| `/{team}/device-config` | Device configuration | Yes (super-user) |
| `/{team}/display-config` | Display settings | Yes (super-user) |
| `/monitor-display` | Public monitor display | No |
| `/scan-attendance` | Mobile QR scanner | Yes |
| `/api/monitor/check-in` | Scan QR code API | No |
| `/api/monitor/stats` | Today's stats API | No |
| `/api/monitor/onsite` | On-site students API | No |

## License

MIT
