<?php
require_once __DIR__ . '/_mail.php';
require_once __DIR__ . '/_storage.php';

lhf_admin_required();

$agreement = lhf_find_agreement((string)($_GET['agreementId'] ?? ''));
if (!$agreement) {
    lhf_json(404, ['message' => 'Agreement not found']);
}
if (($agreement['status'] ?? '') !== 'SIGNED_RECEIVED') {
    lhf_json(409, ['message' => 'Signed agreement must be received before support is marked ready']);
}
$application = lhf_find_application((string)$agreement['applicationId']);
if (!$application) {
    lhf_json(404, ['message' => 'Application not found']);
}

$updated = lhf_update_agreement((string)$agreement['id'], [
    'supportReadyAt' => gmdate('c'),
], 'support.marked_ready');
lhf_update_application_status((string)$application['id'], 'SUPPORT_READY_FOR_RELEASE');

lhf_json(200, ['message' => 'Support marked ready for release', 'agreement' => $updated]);
