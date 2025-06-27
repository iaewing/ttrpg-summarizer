<?php

namespace App\Services;

use Exception;

class DeepgramService
{
    private string $apiKey;
    private string $apiUrl;

    public function __construct()
    {
        $this->apiKey = config('services.deepgram.key', '55619a7d060bc43a138e8e39f6064323a087a48a');
        $this->apiUrl = 'https://api.deepgram.com/v1/listen?model=nova-3&diarize=true&smart_format=true&punctuate=true&paragraphs=true';
    }

    public function transcribeAudio(string $audioFilePath): array
    {
        if (!file_exists($audioFilePath)) {
            throw new Exception("Audio file not found: {$audioFilePath}");
        }

        $audioData = file_get_contents($audioFilePath);
        if ($audioData === false) {
            throw new Exception("Failed to read audio file: {$audioFilePath}");
        }

        $curl = curl_init();

        curl_setopt_array($curl, [
            CURLOPT_URL => $this->apiUrl,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $audioData,
            CURLOPT_HTTPHEADER => [
                'Authorization: Token ' . $this->apiKey,
                'Content-Type: audio/m4a',
                'Content-Length: ' . strlen($audioData)
            ],
            CURLOPT_TIMEOUT => 120,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_SSL_VERIFYPEER => true,
        ]);

        $response = curl_exec($curl);
        
        if (curl_error($curl)) {
            $error = curl_error($curl);
            curl_close($curl);
            throw new Exception("cURL error: {$error}");
        }

        $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
        curl_close($curl);

        if ($httpCode !== 200) {
            throw new Exception("HTTP error {$httpCode}: {$response}");
        }

        $data = json_decode($response, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception("Failed to parse JSON response: " . json_last_error_msg());
        }

        return $this->processTranscriptionResponse($data);
    }

    private function processTranscriptionResponse(array $data): array
    {
        $result = [
            'transcript' => '',
            'confidence' => null,
            'speakers' => [],
            'words' => [],
            'full_response' => $data
        ];

        if (!isset($data['results']['channels'][0]['alternatives'][0])) {
            return $result;
        }

        $alternative = $data['results']['channels'][0]['alternatives'][0];
        
        $result['transcript'] = $alternative['transcript'] ?? '';
        $result['confidence'] = $alternative['confidence'] ?? null;
        
        if (isset($alternative['words'])) {
            $result['words'] = $alternative['words'];
        }

        if (isset($alternative['paragraphs']['paragraphs'])) {
            $speakers = [];
            foreach ($alternative['paragraphs']['paragraphs'] as $paragraph) {
                foreach ($paragraph['sentences'] as $sentence) {
                    $speakerNumber = $sentence['speaker'] ?? 0;
                    $speakerLabel = "Speaker {$speakerNumber}";
                    
                    if (!isset($speakers[$speakerLabel])) {
                        $speakers[$speakerLabel] = [];
                    }
                    
                    $speakers[$speakerLabel][] = [
                        'text' => $sentence['text'],
                        'start' => $sentence['start'] ?? null,
                        'end' => $sentence['end'] ?? null
                    ];
                }
            }
            $result['speakers'] = $speakers;
        }

        return $result;
    }

    public function getSupportedMimeTypes(): array
    {
        return [
            'audio/mpeg',
            'audio/mp3',
            'audio/wav',
            'audio/m4a',
            'audio/aac',
            'audio/ogg',
            'audio/webm',
            'audio/flac'
        ];
    }
} 