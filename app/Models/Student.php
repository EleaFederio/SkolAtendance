<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Student extends Model
{
    protected $fillable = [
        'first_name',
        'last_name',
        'picture',
        'middle_initial',
        'date_of_birth',
        'gender',
        'address',
        'lrn',
        'grade_level',
        'section',
        'guardian_name',
        'guardian_contact_number',
        'qr_code',
    ];

    protected $casts = [
        'date_of_birth' => 'date:Y-m-d',
    ];

    protected static function booted(): void
    {
        static::creating(function (Student $student) {
            if (empty($student->qr_code)) {
                $student->qr_code = Str::uuid()->toString();
            }
        });
    }
}
