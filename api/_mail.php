<?php
declare(strict_types=1);

const LHF_MAIL_TO = 'info@lifespringhf.org';
const LHF_MAIL_FROM = 'noreply@lifespringhf.org';

function lhf_json(int $status, array $payload): void {
    http_response_code($status);
    header('Content-Type: application/json');
    echo json_encode($payload);
    exit;
}

function lhf_value(string $key): string {
    return trim((string)($_POST[$key] ?? ''));
}

function lhf_require(array $keys): void {
    foreach ($keys as $key) {
        if (lhf_value($key) === '') {
            lhf_json(400, ['message' => 'Missing required fields']);
        }
    }
}

function lhf_checked(string $key): bool {
    $value = strtolower(lhf_value($key));
    return in_array($value, ['accepted', 'on', 'true', 'yes', '1'], true);
}

function lhf_require_checks(array $keys): void {
    foreach ($keys as $key) {
        if (!lhf_checked($key)) {
            lhf_json(400, ['message' => 'Please complete all required declarations']);
        }
    }
}

function lhf_reference(string $prefix): string {
    return $prefix . '-' . date('Y') . '-' . random_int(1000, 9999);
}

function lhf_uploaded_files(array $fieldNames): array {
    $files = [];
    foreach ($fieldNames as $field) {
        if (!isset($_FILES[$field])) {
            continue;
        }

        $file = $_FILES[$field];
        if (is_array($file['name'])) {
            continue;
        }

        if (($file['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_OK) {
            $files[] = [
                'name' => basename((string)$file['name']),
                'type' => (string)($file['type'] ?? 'application/octet-stream'),
                'tmp_name' => (string)$file['tmp_name'],
            ];
        }
    }
    return $files;
}

function lhf_require_files(array $fieldNames): void {
    foreach ($fieldNames as $field) {
        if (!isset($_FILES[$field]) || ($_FILES[$field]['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
            lhf_json(400, ['message' => 'Missing required upload']);
        }
    }
}

function lhf_send_mail(string $to, string $subject, string $body, string $replyTo = '', array $attachments = []): bool {
    $from = getenv('MAIL_FROM') ?: LHF_MAIL_FROM;
    $headers = [
        'From: Lifespring Humanitarian Foundation <' . $from . '>',
        'MIME-Version: 1.0',
    ];

    if ($replyTo !== '') {
        $headers[] = 'Reply-To: ' . $replyTo;
    }

    if (count($attachments) === 0) {
        $headers[] = 'Content-Type: text/plain; charset=UTF-8';
        return mail($to, $subject, $body, implode("\r\n", $headers));
    }

    $boundary = 'lhf_' . bin2hex(random_bytes(12));
    $headers[] = 'Content-Type: multipart/mixed; boundary="' . $boundary . '"';

    $message = "--{$boundary}\r\n";
    $message .= "Content-Type: text/plain; charset=UTF-8\r\n";
    $message .= "Content-Transfer-Encoding: 8bit\r\n\r\n";
    $message .= $body . "\r\n";

    foreach ($attachments as $attachment) {
        $tmpName = (string)($attachment['tmp_name'] ?? $attachment['path'] ?? '');
        if ($tmpName === '' || (!is_uploaded_file($tmpName) && !is_file($tmpName))) {
            continue;
        }
        $content = chunk_split(base64_encode((string)file_get_contents($tmpName)));
        $message .= "--{$boundary}\r\n";
        $message .= "Content-Type: {$attachment['type']}; name=\"{$attachment['name']}\"\r\n";
        $message .= "Content-Disposition: attachment; filename=\"{$attachment['name']}\"\r\n";
        $message .= "Content-Transfer-Encoding: base64\r\n\r\n";
        $message .= $content . "\r\n";
    }

    $message .= "--{$boundary}--";
    return mail($to, $subject, $message, implode("\r\n", $headers));
}

function lhf_mail_to(): string {
    return getenv('MAIL_TO') ?: LHF_MAIL_TO;
}

function lhf_confirmation(string $email, string $name, string $reference, string $type): void {
    if ($email === '') {
        return;
    }

    lhf_send_mail(
        $email,
        'Your Lifespring Application Has Been Received',
        "Dear {$name},\n\nThank you. Your {$type} has been received by Lifespring Humanitarian Foundation.\n\nReference: {$reference}\n\nThis is not an approval notice. The Foundation will review the information provided and contact you if further information is required.\n\nLifespring Humanitarian Foundation\nRestoring Hope. Empowering Futures."
    );
}
