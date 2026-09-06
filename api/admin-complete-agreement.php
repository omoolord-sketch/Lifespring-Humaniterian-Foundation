<?php
require_once __DIR__ . '/_mail.php';
require_once __DIR__ . '/_storage.php';

lhf_admin_required();

$agreement = lhf_find_agreement((string)($_GET['agreementId'] ?? ''));
if (!$agreement) {
    lhf_json(404, ['message' => 'Agreement not found']);
}
if (($agreement['supportReadyAt'] ?? '') === '') {
    lhf_json(409, ['message' => 'Support must be marked ready before completion']);
}
$application = lhf_find_application((string)$agreement['applicationId']);
if (!$application) {
    lhf_json(404, ['message' => 'Application not found']);
}

$updated = lhf_update_agreement((string)$agreement['id'], [
    'status' => 'COMPLETED',
    'completedAt' => gmdate('c'),
], 'application.completed');
lhf_update_application_status((string)$application['id'], 'COMPLETED');

lhf_json(200, ['message' => 'Application completed', 'agreement' => $updated]);
