<?php

namespace App\Http\Controllers;

use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
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

        $student->update($validated);

        return Redirect::route('students.records');
    }

    public function destroy(Request $request)
    {
        $studentId = $request->route('studentId');
        $student = Student::findOrFail($studentId);
        $student->delete();

        return Redirect::route('students.records');
    }
}
