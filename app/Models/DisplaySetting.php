<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DisplaySetting extends Model
{
    protected $fillable = [
        'welcome_enabled',
        'welcome_message',
        'clock_enabled',
        'stats_enabled',
        'media_path',
        'media_type',
        'media_enabled',
        'refresh_interval',
        'auto_switch_attendance',
    ];

    protected $casts = [
        'welcome_enabled' => 'boolean',
        'clock_enabled' => 'boolean',
        'stats_enabled' => 'boolean',
        'media_enabled' => 'boolean',
        'refresh_interval' => 'integer',
        'auto_switch_attendance' => 'boolean',
    ];

    public static function getOrCreate(): self
    {
        return static::firstOrCreate([], [
            'welcome_message' => 'Welcome to our School',
        ]);
    }
}
