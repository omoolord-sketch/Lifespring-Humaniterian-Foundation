<?php
require_once __DIR__ . '/_mail.php';
require_once __DIR__ . '/_storage.php';

lhf_admin_required();

$input = json_decode((string)file_get_contents('php://input'), true);
$agreement = lhf_find_agreement((string)($_GET['agreementId'] ?? ''));
if (!$agreement) {
    lhf_json(404, ['message' => 'Agreement not found']);
}
$application = lhf_find_application((string)$agreement['applicationId']);
if (!$application) {
    lhf_json(404, ['message' => 'Application not found']);
}

$updated = lhf_update_agreement((string)$agreement['id'], [
    'status' => 'SIGNED_RECEIVED',
    'signedReceivedAt' => gmdate('c'),
    'notes' => is_array($input) ? ($input['note'] ?? ($agreement['notes'] ?? '')) : ($agreement['notes'] ?? ''),
], 'agreement.signed_confirmed');
lhf_update_application_status((string)$application['id'], 'SIGNED_AGREEMENT_RECEIVED');

lhf_json(200, ['message' => 'Signed agreement marked as received', 'agreement' => $updated]);
