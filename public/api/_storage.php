<?php
declare(strict_types=1);

function lhf_data_dir(): string {
    $dir = __DIR__ . '/data';
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
    return $dir;
}

function lhf_records_path(): string {
    return lhf_data_dir() . '/records.json';
}

function lhf_default_records(): array {
    return [
        'applications' => [],
        'agreements' => [],
        'complaints' => [],
        'auditLog' => [],
    ];
}

function lhf_records(): array {
    $path = lhf_records_path();
    if (!file_exists($path)) {
        lhf_save_records(lhf_default_records());
    }

    $decoded = json_decode((string)file_get_contents($path), true);
    if (!is_array($decoded)) {
        return lhf_default_records();
    }

    return array_merge(lhf_default_records(), $decoded);
}

function lhf_save_records(array $records): void {
    file_put_contents(lhf_records_path(), json_encode($records, JSON_PRETTY_PRINT), LOCK_EX);
}

function lhf_id(string $prefix): string {
    return $prefix . '_' . time() . '_' . bin2hex(random_bytes(4));
}

function lhf_audit(array &$records, string $event, string $entityType, string $entityId, array $metadata = []): void {
    array_unshift($records['auditLog'], [
        'id' => lhf_id('aud'),
        'event' => $event,
        'entityType' => $entityType,
        'entityId' => $entityId,
        'timestamp' => gmdate('c'),
        'metadata' => $metadata,
    ]);
}

function lhf_add_application(array $application): array {
    $records = lhf_records();
    $now = gmdate('c');
    $application = array_merge($application, [
        'id' => lhf_id('app'),
        'createdAt' => $now,
        'updatedAt' => $now,
    ]);
    array_unshift($records['applications'], $application);
    lhf_audit($records, 'application.submitted', 'application', $application['id'], [
        'reference' => $application['reference'] ?? '',
        'type' => $application['type'] ?? '',
    ]);
    lhf_save_records($records);
    return $application;
}

function lhf_update_application_status(string $applicationId, string $status): ?array {
    $records = lhf_records();
    foreach ($records['applications'] as &$application) {
        if (($application['id'] ?? '') === $applicationId) {
            $application['status'] = $status;
            $application['updatedAt'] = gmdate('c');
            lhf_audit($records, 'application.status_changed', 'application', $applicationId, [
                'status' => $status,
            ]);
            lhf_save_records($records);
            return $application;
        }
    }
    return null;
}

function lhf_add_complaint(array $complaint): array {
    $records = lhf_records();
    $now = gmdate('c');
    $complaint = array_merge($complaint, [
        'id' => lhf_id(($complaint['type'] ?? '') === 'CONCERN' ? 'con' : 'cmp'),
        'createdAt' => $now,
        'updatedAt' => $now,
    ]);
    array_unshift($records['complaints'], $complaint);
    lhf_audit($records, strtolower((string)$complaint['type']) . '.submitted', strtolower((string)$complaint['type']), $complaint['id'], [
        'reference' => $complaint['reference'] ?? '',
    ]);
    lhf_save_records($records);
    return $complaint;
}

function lhf_admin_required(): void {
    $expected = getenv('ADMIN_API_TOKEN') ?: lhf_file_admin_token();
    if ($expected === '') {
        lhf_json(503, ['message' => 'Admin API token is not configured on the server. Create api/data/admin-token.txt or set ADMIN_API_TOKEN.']);
    }
    $provided = $_SERVER['HTTP_X_ADMIN_TOKEN'] ?? '';
    if (!hash_equals($expected, $provided)) {
        lhf_json(401, ['message' => 'Unauthorised admin request']);
    }
}

function lhf_file_admin_token(): string {
    $path = lhf_data_dir() . '/admin-token.txt';
    if (!file_exists($path)) {
        return '';
    }
    return trim((string)file_get_contents($path));
}
