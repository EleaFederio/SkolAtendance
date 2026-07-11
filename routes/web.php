<?php

use App\Enums\Role;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\Teams\TeamInvitationController;
use App\Http\Middleware\EnsureRole;
use App\Http\Middleware\EnsureTeamMembership;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::get('monitor-display', [\App\Http\Controllers\MonitorController::class, 'index'])->name('monitor-display');
Route::get('api/monitor/recent', [\App\Http\Controllers\MonitorController::class, 'recentEntries'])->name('monitor.recent');
Route::get('api/monitor/stats', [\App\Http\Controllers\MonitorController::class, 'stats'])->name('monitor.stats');
Route::get('api/monitor/onsite', [\App\Http\Controllers\MonitorController::class, 'onsiteStudents'])->name('monitor.onsite');
Route::post('api/monitor/check-in', [\App\Http\Controllers\MonitorController::class, 'checkIn'])->name('monitor.checkIn');

Route::middleware(['auth'])->group(function () {
    Route::get('scan-attendance', [\App\Http\Controllers\MonitorController::class, 'scan'])->name('scan-attendance');
});

Route::prefix('{current_team}')
    ->middleware(['auth', 'verified', EnsureTeamMembership::class])
    ->group(function () {
        Route::get('dashboard', DashboardController::class)->name('dashboard');

        // Student routes - accessible by both roles
        Route::get('students/records', [StudentController::class, 'records'])->name('students.records');

        // Student CRUD - super-user only
        Route::middleware(EnsureRole::class . ':' . Role::SUPER_USER->value)->group(function () {
            Route::post('students', [StudentController::class, 'store'])->name('students.store');
            Route::post('students/{studentId}/update', [StudentController::class, 'update'])->name('students.update');
            Route::post('students/{studentId}/destroy', [StudentController::class, 'destroy'])->name('students.destroy');
            Route::post('students/{studentId}/assign-qr', [StudentController::class, 'assignQr'])->name('students.assignQr');
            Route::post('students/import', [StudentController::class, 'import'])->name('students.import');
        });

        // Device Config - super-user only
        Route::middleware(EnsureRole::class . ':' . Role::SUPER_USER->value)->group(function () {
            Route::get('device-config', fn () => \Inertia\Inertia::render('device-config/index'))->name('device-config');
            Route::get('display-config', [\App\Http\Controllers\DisplayConfigController::class, 'index'])->name('display-config');
            Route::post('display-config', [\App\Http\Controllers\DisplayConfigController::class, 'save'])->name('display-config.save');
        });
    });

Route::middleware(['auth'])->group(function () {
    Route::get('invitations/{invitation}/accept', [TeamInvitationController::class, 'accept'])->name('invitations.accept');
    Route::delete('invitations/{invitation}', [TeamInvitationController::class, 'decline'])->name('invitations.decline');
});

require __DIR__.'/settings.php';
