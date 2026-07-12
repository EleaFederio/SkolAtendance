<?php

namespace App\Http\Controllers;

use App\Models\DisplaySetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class DisplayConfigController extends Controller
{
    public function index(): Response
    {
        $settings = DisplaySetting::getOrCreate();

        return Inertia::render('display-config/index', [
            'settings' => $settings,
        ]);
    }

    public function save(Request $request)
    {
        $validated = $request->validate([
            'welcome_enabled' => 'required|boolean',
            'welcome_message' => 'required|string|max:255',
            'clock_enabled' => 'required|boolean',
            'stats_enabled' => 'required|boolean',
            'media_enabled' => 'required|boolean',
            'auto_switch_attendance' => 'required|boolean',
            'refresh_interval' => 'required|integer|min:1|max:60',
            'media' => 'nullable|file|mimes:jpg,jpeg,png,gif,mp4,mov,avi,webm|max:51200',
        ]);

        $settings = DisplaySetting::getOrCreate();

        if ($request->hasFile('media')) {
            if ($settings->media_path) {
                Storage::disk('public')->delete($settings->media_path);
            }
            $file = $request->file('media');
            $validated['media_path'] = $file->store('display-media', 'public');
            $validated['media_type'] = str_starts_with($file->getMimeType(), 'video') ? 'video' : 'image';
        }

        unset($validated['media']);
        $settings->update($validated);

        return back()->with('success', 'Display settings saved.');
    }
}
