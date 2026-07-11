<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\DisplaySetting;
use App\Models\Student;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MonitorController extends Controller
{
    public function index(): Response
    {
        $settings = DisplaySetting::getOrCreate();

        return Inertia::render('monitor-display', [
            'settings' => [
                'welcome_enabled' => $settings->welcome_enabled,
                'welcome_message' => $settings->welcome_message,
                'clock_enabled' => $settings->clock_enabled,
                'stats_enabled' => $settings->stats_enabled,
                'media_path' => $settings->media_path,
                'media_type' => $settings->media_type,
                'media_enabled' => $settings->media_enabled,
                'refresh_interval' => $settings->refresh_interval,
            ],
        ]);
    }

    public function scan(): Response
    {
        return Inertia::render('scan-attendance');
    }

    public function recentEntries(): JsonResponse
    {
        $entries = Attendance::with('student')
            ->where('scanned_at', '>=', now()->startOfDay())
            ->orderByDesc('scanned_at')
            ->limit(50)
            ->get()
            ->map(fn ($a) => [
                'id' => $a->id,
                'type' => $a->type,
                'scanned_at' => $a->scanned_at->toISOString(),
                'student' => [
                    'id' => $a->student->id,
                    'first_name' => $a->student->first_name,
                    'last_name' => $a->student->last_name,
                    'middle_initial' => $a->student->middle_initial,
                    'grade_level' => $a->student->grade_level,
                    'section' => $a->student->section,
                    'picture' => $a->student->picture,
                ],
            ]);

        return response()->json($entries);
    }

    public function stats(): JsonResponse
    {
        $today = now()->startOfDay();

        $totalStudents = Student::count();
        $entered = Attendance::where('type', 'in')
            ->where('scanned_at', '>=', $today)
            ->distinct('student_id')
            ->count('student_id');
        $absent = $totalStudents - $entered;

        return response()->json([
            'total_students' => $totalStudents,
            'entered' => $entered,
            'absent' => max(0, $absent),
        ]);
    }

    public function onsiteStudents(): JsonResponse
    {
        $today = now()->startOfDay();

        $students = Student::whereIn('id', function ($query) use ($today) {
            $query->select('student_id')
                ->from('attendances')
                ->where('type', 'in')
                ->where('scanned_at', '>=', $today)
                ->groupBy('student_id')
                ->havingRaw('COUNT(*) % 2 = 1');
        })
        ->get()
        ->map(function ($student) {
            $lastIn = Attendance::where('student_id', $student->id)
                ->where('type', 'in')
                ->where('scanned_at', '>=', now()->startOfDay())
                ->latest('scanned_at')
                ->first();

            return [
                'id' => $student->id,
                'first_name' => $student->first_name,
                'last_name' => $student->last_name,
                'middle_initial' => $student->middle_initial,
                'grade_level' => $student->grade_level,
                'section' => $student->section,
                'picture' => $student->picture,
                'arrived_at' => $lastIn ? $lastIn->scanned_at->toISOString() : null,
            ];
        });

        return response()->json($students);
    }

    public function checkIn(Request $request): JsonResponse
    {
        $request->validate([
            'qr_code' => 'required|string',
        ]);

        $student = Student::where('qr_code', $request->qr_code)->first();

        if (!$student) {
            return response()->json(['error' => 'Invalid QR code'], 404);
        }

        $lastAttendance = Attendance::where('student_id', $student->id)
            ->where('scanned_at', '>=', now()->startOfDay())
            ->latest('scanned_at')
            ->first();

        $type = ($lastAttendance && $lastAttendance->type === 'in') ? 'out' : 'in';

        $attendance = Attendance::create([
            'student_id' => $student->id,
            'type' => $type,
            'scanned_at' => now(),
        ]);

        return response()->json([
            'attendance' => [
                'id' => $attendance->id,
                'type' => $attendance->type,
                'scanned_at' => $attendance->scanned_at->toISOString(),
            ],
            'student' => [
                'id' => $student->id,
                'first_name' => $student->first_name,
                'last_name' => $student->last_name,
                'middle_initial' => $student->middle_initial,
                'grade_level' => $student->grade_level,
                'section' => $student->section,
                'picture' => $student->picture,
            ],
        ]);
    }
}
