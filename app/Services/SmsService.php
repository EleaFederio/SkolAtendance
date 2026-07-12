<?php

namespace App\Services;

use App\Models\SmsLog;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SmsService
{
    private array $settings;

    public function __construct(?array $settings = null)
    {
        $this->settings = $settings ?? $this->loadSettings();
    }

    public function send(string $to, string $message, ?int $studentId = null, ?string $type = null): bool
    {
        try {
            $provider = $this->settings['provider'];

            if ($provider === 'httpsms') {
                $sent = $this->sendViaHttpsms($to, $message);
            } elseif ($provider === 'smsgate') {
                $sent = $this->sendViaSmsgate($to, $message);
            } else {
                Log::warning("Unknown SMS provider: {$provider}");
                return false;
            }

            SmsLog::create([
                'student_id' => $studentId,
                'type' => $type,
                'recipient' => $to,
                'message' => $message,
                'provider' => $provider,
                'status' => $sent ? 'sent' : 'failed',
            ]);

            return $sent;
        } catch (\Exception $e) {
            Log::error('SMS send failed: ' . $e->getMessage());

            SmsLog::create([
                'student_id' => $studentId,
                'type' => $type,
                'recipient' => $to,
                'message' => $message,
                'provider' => $this->settings['provider'] ?? 'unknown',
                'status' => 'failed',
            ]);

            return false;
        }
    }

    private function sendViaHttpsms(string $to, string $message): bool
    {
        $apiKey = $this->settings['api_key'] ?? '';
        $from = $this->settings['sender_number'] ?? '';

        if (empty($apiKey) || empty($from)) {
            Log::warning('HTTPSMS: Missing API key or sender number');
            return false;
        }

        $response = Http::withHeaders([
            'x-api-key' => $apiKey,
            'Content-Type' => 'application/json',
        ])->timeout(15)->post('https://api.httpsms.app/v1/messages/send', [
            'from' => $from,
            'to' => $to,
            'text' => $message,
        ]);

        return $response->successful();
    }

    private function sendViaSmsgate(string $to, string $message): bool
    {
        $baseUrl = $this->settings['api_url'] ?? '';
        $username = $this->settings['api_key'] ?? '';
        $password = $this->settings['api_secret'] ?? '';
        $deviceId = $this->settings['device_id'] ?? '';

        if (empty($baseUrl) || empty($username) || empty($password)) {
            Log::warning('SMSGate: Missing API URL, username, or password');
            return false;
        }

        $url = rtrim($baseUrl, '/') . '/messages';

        $body = [
            'phoneNumbers' => [$to],
            'textMessage' => [
                'text' => $message,
            ],
        ];

        if (!empty($deviceId)) {
            $body['deviceId'] = $deviceId;
        }

        $response = Http::withBasicAuth($username, $password)
            ->withHeaders([
                'Content-Type' => 'application/json',
            ])
            ->timeout(15)
            ->post($url, $body);

        Log::info('SMSGate response', [
            'status' => $response->status(),
            'body' => $response->body(),
        ]);

        return $response->successful();
    }

    private function loadSettings(): array
    {
        $defaults = [
            'provider' => 'httpsms',
            'api_key' => '',
            'api_secret' => '',
            'api_url' => '',
            'device_id' => '',
            'sender_number' => '',
            'enabled' => false,
        ];

        if (\Illuminate\Support\Facades\Storage::exists('sms-settings.json')) {
            $json = \Illuminate\Support\Facades\Storage::get('sms-settings.json');
            $data = json_decode($json, true);
            if (is_array($data)) {
                return array_merge($defaults, $data);
            }
        }

        return $defaults;
    }
}
