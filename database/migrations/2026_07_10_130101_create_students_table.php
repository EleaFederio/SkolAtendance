<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('middle_initial')->nullable();
            $table->date('date_of_birth');
            $table->string('gender');
            $table->text('address');
            $table->string('lrn')->unique();
            $table->string('grade_level');
            $table->string('section');
            $table->string('guardian_name');
            $table->string('guardian_contact_number');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};
