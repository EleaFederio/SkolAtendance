<?php

namespace App\Http\Controllers;

use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class StudentController extends Controller
{
    public function records(Request $request): Response
    {
        $students = Student::orderBy('last_name')
            ->orderBy('first_name')
            ->get();

        return Inertia::render('students/records', [
            'students' => $students,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'picture' => 'nullable|image|max:2048',
            'middle_initial' => 'nullable|string|max:10',
            'date_of_birth' => 'required|date',
            'gender' => 'required|string|max:255',
            'address' => 'required|string',
            'lrn' => 'required|string|unique:students,lrn|max:20',
            'grade_level' => 'required|string|max:255',
            'section' => 'required|string|max:255',
            'guardian_name' => 'required|string|max:255',
            'guardian_contact_number' => 'required|string|max:20',
        ]);

        if ($request->hasFile('picture')) {
            $validated['picture'] = $request->file('picture')->store('students', 'public');
        }

        Student::create($validated);

        return Redirect::route('students.records');
    }

    public function update(Request $request)
    {
        $studentId = $request->route('studentId');
        $student = Student::findOrFail($studentId);

        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'picture' => 'nullable|image|max:2048',
            'middle_initial' => 'nullable|string|max:10',
            'date_of_birth' => 'required|date',
            'gender' => 'required|string|max:255',
            'address' => 'required|string',
            'lrn' => 'required|string|unique:students,lrn,' . $student->id . '|max:20',
            'grade_level' => 'required|string|max:255',
            'section' => 'required|string|max:255',
            'guardian_name' => 'required|string|max:255',
            'guardian_contact_number' => 'required|string|max:20',
        ]);

        if ($request->hasFile('picture')) {
            if ($student->picture) {
                Storage::disk('public')->delete($student->picture);
            }
            $validated['picture'] = $request->file('picture')->store('students', 'public');
        }

        $student->update($validated);

        return Redirect::route('students.records');
    }

    public function destroy(Request $request)
    {
        $studentId = $request->route('studentId');
        $student = Student::findOrFail($studentId);

        if ($student->picture) {
            Storage::disk('public')->delete($student->picture);
        }

        $student->delete();

        return Redirect::route('students.records');
    }

    public function assignQr(Request $request)
    {
        $studentId = $request->route('studentId');
        $student = Student::findOrFail($studentId);

        $validated = $request->validate([
            'qr_code' => 'required|string|unique:students,qr_code,' . $student->id,
        ]);

        $student->update($validated);

        return Redirect::route('students.records');
    }

    public function import(Request $request)
    {
        $request->validate([
            'csv_file' => 'required|file|mimes:csv,txt|max:10240',
        ]);

        $file = $request->file('csv_file');
        $handle = fopen($file->getPathname(), 'r');

        if ($handle === false) {
            return back()->withErrors(['csv_file' => 'Failed to open the CSV file.']);
        }

        $headers = fgetcsv($handle);

        if ($headers === false) {
            fclose($handle);
            return back()->withErrors(['csv_file' => 'The CSV file is empty.']);
        }

        $headers = array_map(function ($h) {
            return trim(str_replace("\xEF\xBB\xBF", '', $h));
        }, $headers);

        $expectedHeaders = [
            'firstName',
            'lastName',
            'middleInitial',
            'dateOfBirth',
            'gender',
            'address',
            'lrn',
            'gradeLevel',
            'section',
            'guardianName',
            'guardianContactNumber',
        ];

        $normalizedHeaders = array_map('strtolower', $headers);
        $normalizedExpected = array_map('strtolower', $expectedHeaders);

        if (array_diff($normalizedExpected, $normalizedHeaders)) {
            fclose($handle);
            return back()->withErrors(['csv_file' => 'Invalid CSV format. Expected headers: ' . implode(', ', $expectedHeaders)]);
        }

        $headerMap = [];
        foreach ($expectedHeaders as $expected) {
            foreach ($headers as $index => $header) {
                if (strtolower($header) === strtolower($expected)) {
                    $headerMap[$expected] = $index;
                    break;
                }
            }
        }

        $imported = 0;
        $errors = [];
        $rowNumber = 1;

        while (($row = fgetcsv($handle)) !== false) {
            $rowNumber++;

            $data = [
                'first_name' => $row[$headerMap['firstName']] ?? '',
                'last_name' => $row[$headerMap['lastName']] ?? '',
                'middle_initial' => $row[$headerMap['middleInitial']] ?? null,
                'date_of_birth' => $row[$headerMap['dateOfBirth']] ?? '',
                'gender' => $row[$headerMap['gender']] ?? '',
                'address' => $row[$headerMap['address']] ?? '',
                'lrn' => $row[$headerMap['lrn']] ?? '',
                'grade_level' => $row[$headerMap['gradeLevel']] ?? '',
                'section' => $row[$headerMap['section']] ?? '',
                'guardian_name' => $row[$headerMap['guardianName']] ?? '',
                'guardian_contact_number' => $row[$headerMap['guardianContactNumber']] ?? '',
            ];

            $validator = \Illuminate\Support\Facades\Validator::make($data, [
                'first_name' => 'required|string|max:255',
                'last_name' => 'required|string|max:255',
                'middle_initial' => 'nullable|string|max:10',
                'date_of_birth' => 'required|date',
                'gender' => 'required|string|max:255',
                'address' => 'required|string',
                'lrn' => 'required|string|unique:students,lrn|max:20',
                'grade_level' => 'required|string|max:255',
                'section' => 'required|string|max:255',
                'guardian_name' => 'required|string|max:255',
                'guardian_contact_number' => 'required|string|max:20',
            ]);

            if ($validator->fails()) {
                $errors[] = "Row {$rowNumber}: " . implode(', ', $validator->errors()->all());
                continue;
            }

            Student::create($validator->validated());
            $imported++;
        }

        fclose($handle);

        if (!empty($errors)) {
            return back()->with([
                'imported' => $imported,
                'import_errors' => $errors,
            ]);
        }

        return Redirect::route('students.records')->with('imported', $imported);
    }
}
