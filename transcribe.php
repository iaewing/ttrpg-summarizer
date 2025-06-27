<?php

/**
 * Deepgram Audio Transcription Script
 * 
 * This script transcribes the sample.m4a file using Deepgram's Nova 3 model
 * with speaker diarization, smart formatting, and punctuation
 * Usage: php transcribe.php
 */

// Configuration
$deepgramApiKey = '55619a7d060bc43a138e8e39f6064323a087a48a';
$audioFile = __DIR__ . '/sample2.m4a';
$apiUrl = 'https://api.deepgram.com/v1/listen?model=nova-3&diarize=true&smart_format=true&punctuate=true&paragraphs=true';

function transcribeAudio($apiKey, $audioFilePath, $apiUrl) {
    // Check if audio file exists
    if (!file_exists($audioFilePath)) {
        throw new Exception("Audio file not found: {$audioFilePath}");
    }

    // Read the audio file
    $audioData = file_get_contents($audioFilePath);
    if ($audioData === false) {
        throw new Exception("Failed to read audio file: {$audioFilePath}");
    }

    // Initialize cURL
    $curl = curl_init();

    // Set cURL options
    curl_setopt_array($curl, [
        CURLOPT_URL => $apiUrl,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $audioData,
        CURLOPT_HTTPHEADER => [
            'Authorization: Token ' . $apiKey,
            'Content-Type: audio/m4a',
            'Content-Length: ' . strlen($audioData)
        ],
        CURLOPT_TIMEOUT => 120, // 2 minutes timeout
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_SSL_VERIFYPEER => true,
    ]);

    // Execute the request
    echo "Sending audio file to Deepgram for transcription...\n";
    $response = curl_exec($curl);
    
    // Check for cURL errors
    if (curl_error($curl)) {
        $error = curl_error($curl);
        curl_close($curl);
        throw new Exception("cURL error: {$error}");
    }

    // Get HTTP status code
    $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
    curl_close($curl);

    // Check HTTP status
    if ($httpCode !== 200) {
        throw new Exception("HTTP error {$httpCode}: {$response}");
    }

    return $response;
}

function displayTranscription($jsonResponse) {
    $data = json_decode($jsonResponse, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("Failed to parse JSON response: " . json_last_error_msg());
    }

    echo "\n" . str_repeat("=", 60) . "\n";
    echo "TRANSCRIPTION RESULTS\n";
    echo str_repeat("=", 60) . "\n\n";

    if (isset($data['results']['channels'][0]['alternatives'][0])) {
        $alternative = $data['results']['channels'][0]['alternatives'][0];
        
        // Display full transcript
        echo "Full Transcript:\n";
        echo str_repeat("-", 40) . "\n";
        echo $alternative['transcript'] . "\n\n";
        
        // Display confidence score
        if (isset($alternative['confidence'])) {
            echo "Confidence: " . round($alternative['confidence'] * 100, 2) . "%\n\n";
        }
        
        // Display word-level results with timestamps if available
        if (isset($alternative['words']) && !empty($alternative['words'])) {
            echo "Word-level Timeline:\n";
            echo str_repeat("-", 40) . "\n";
            
            foreach ($alternative['words'] as $word) {
                $start = isset($word['start']) ? number_format($word['start'], 2) : 'N/A';
                $end = isset($word['end']) ? number_format($word['end'], 2) : 'N/A';
                $confidence = isset($word['confidence']) ? round($word['confidence'] * 100, 1) : 'N/A';
                
                echo sprintf(
                    "[%s-%s] %s (conf: %s%%)\n",
                    $start,
                    $end,
                    $word['word'],
                    $confidence
                );
            }
        }
        
        // Display speaker diarization if available
        if (isset($alternative['paragraphs']['paragraphs'])) {
            echo "\nSpeaker Diarization:\n";
            echo str_repeat("-", 40) . "\n";
            
            foreach ($alternative['paragraphs']['paragraphs'] as $paragraph) {
                foreach ($paragraph['sentences'] as $sentence) {
                    $speaker = isset($sentence['speaker']) ? "Speaker {$sentence['speaker']}" : "Unknown Speaker";
                    $start = isset($sentence['start']) ? number_format($sentence['start'], 2) : 'N/A';
                    $end = isset($sentence['end']) ? number_format($sentence['end'], 2) : 'N/A';
                    
                    echo "{$speaker} [{$start}-{$end}]: {$sentence['text']}\n\n";
                }
            }
        }
    } else {
        echo "No transcription results found in the response.\n";
    }
}

// Main execution
try {
    // Validate API key
    if ($deepgramApiKey === 'YOUR_DEEPGRAM_API_KEY' || empty($deepgramApiKey)) {
        echo "Error: Please set your Deepgram API key.\n";
        echo "You can either:\n";
        echo "1. Set the DEEPGRAM_API_KEY environment variable\n";
        echo "2. Edit this script and replace 'YOUR_DEEPGRAM_API_KEY' with your actual API key\n\n";
        exit(1);
    }

    echo "Deepgram Audio Transcription (Nova 3 Model)\n";
    echo "Audio file: {$audioFile}\n";
    echo "API endpoint: {$apiUrl}\n\n";

    // Transcribe the audio
    $response = transcribeAudio($deepgramApiKey, $audioFile, $apiUrl);
    
    // Display results
    displayTranscription($response);
    
    // Optionally save the full response to a file
    $outputFile = 'transcription_' . date('Y-m-d_H-i-s') . '.json';
    file_put_contents($outputFile, $response);
    echo "\nFull response saved to: {$outputFile}\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}

echo "\nTranscription completed successfully!\n"; 