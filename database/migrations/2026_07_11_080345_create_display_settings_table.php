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
        Schema::create('display_settings', function (Blueprint $table) {
            $table->id();
            $table->boolean('welcome_enabled')->default(true);
            $table->string('welcome_message')->default('Welcome to our School');
            $table->boolean('clock_enabled')->default(true);
            $table->boolean('stats_enabled')->default(true);
            $table->string('media_path')->nullable();
            $table->string('media_type')->nullable();
            $table->boolean('media_enabled')->default(false);
            $table->integer('refresh_interval')->default(5);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('display_settings');
    }
};
