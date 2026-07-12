<?php

namespace App\Http\Controllers;

use App\Services\SmsService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class SmsConfigController extends Controller
{
    public function __construct(private SmsService $smsService)
    {
    }

    public function index(): Response
    {
        $settings = $this->getSettings();

        return Inertia::render('sms-config/index', [
            'smsSettings' => $settings,
        ]);
    }

    public function save(Request $request)
    {
        $validated = $request->validate([
            'provider' => 'required|string|in:httpsms,smsgate',
            'api_key' => 'required|string|max:255',
            'api_secret' => 'nullable|string|max:255',
            'api_url' => 'nullable|string|max:500',
            'device_id' => 'nullable|string|max:255',
            'sender_number' => 'required|string|max:20',
            'enabled' => 'required|boolean',
            'message_attended' => 'nullable|string|max:500',
            'message_left' => 'nullable|string|max:500',
        ]);

        Storage::put('sms-settings.json', json_encode($validated, JSON_PRETTY_PRINT));

        return back()->with('success', 'SMS settings saved.');
    }

    public function test(Request $request)
    {
        $request->validate([
            'provider' => 'required|string|in:httpsms,smsgate',
            'api_key' => 'required|string|max:255',
            'api_secret' => 'nullable|string|max:255',
            'api_url' => 'nullable|string|max:500',
            'device_id' => 'nullable|string|max:255',
            'sender_number' => 'required|string|max:20',
            'test_phone' => 'required|string|max:20',
        ]);

        $settings = [
            'provider' => $request->provider,
            'api_key' => $request->api_key,
            'api_secret' => $request->api_secret,
            'api_url' => $request->api_url,
            'device_id' => $request->device_id,
            'sender_number' => $request->sender_number,
            'enabled' => true,
        ];

        $testSms = new SmsService($settings);
        $message = "CFNHS: This is a test message from your SMS gateway. Sent at " . now()->format('M d, Y h:i A') . ".";
        $sent = $testSms->send($request->test_phone, $message);

        if ($sent) {
            return back()->with('success', 'Test SMS sent successfully to ' . $request->test_phone);
        }

        return back()->with('error', 'Failed to send test SMS. Please check your settings and try again.');
    }

    private function getSettings(): array
    {
        $defaults = [
            'provider' => 'httpsms',
            'api_key' => '',
            'api_secret' => '',
            'api_url' => '',
            'device_id' => '',
            'sender_number' => '',
            'enabled' => false,
            'message_attended' => 'CFNHS: {student_name} has arrived at school at {time}. Grade {grade} - {section}.',
            'message_left' => 'CFNHS: {student_name} has left school at {time}. Grade {grade} - {section}.',
        ];

        if (Storage::exists('sms-settings.json')) {
            $json = Storage::get('sms-settings.json');
            $data = json_decode($json, true);
            if (is_array($data)) {
                return array_merge($defaults, $data);
            }
        }

        return $defaults;
    }
}
