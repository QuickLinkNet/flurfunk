<?php

namespace App\Core;

// Einheitliche JSON-Antwortform, siehe PRD Kapitel 10.
final class Response
{
    public static function json(mixed $data, int $status = 200): never
    {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['success' => true, 'data' => $data, 'error' => null]);
        exit;
    }

    public static function error(string $message, int $status = 400): never
    {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['success' => false, 'data' => null, 'error' => $message]);
        exit;
    }
}
