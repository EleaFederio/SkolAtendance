<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    protected $fillable = [
        'first_name',
        'last_name',
        'middle_initial',
        'date_of_birth',
        'gender',
        'address',
        'lrn',
        'grade_level',
        'section',
        'guardian_name',
        'guardian_contact_number',
    ];

    protected $casts = [
        'date_of_birth' => 'date:Y-m-d',
    ];
}
