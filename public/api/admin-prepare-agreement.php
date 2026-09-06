<?php
require_once __DIR__ . '/_mail.php';
require_once __DIR__ . '/_storage.php';
require_once __DIR__ . '/_agreements.php';

lhf_admin_required();

$applicationId = $_GET['applicationId'] ?? '';
$application = lhf_find_application((string)$applicationId);
if (!$application) {
    lhf_json(404, ['message' => 'Application not found']);
}
if (in_array((string)($application['status'] ?? ''), ['DECLINED', 'WITHDRAWN', 'SUSPENDED'], true)) {
    lhf_json(409, ['message' => 'Cannot generate an agreement for this application status']);
}

$existing = lhf_find_agreement_by_application((string)$application['id']);
if ($existing) {
    lhf_json(200, ['message' => 'Agreement already generated', 'agreement' => $existing]);
}

$reference = lhf_agreement_ref((string)$application['type']);
$filename = lhf_agreement_filename($application);
$path = lhf_agreements_dir() . '/' . $filename;
lhf_generate_agreement_pdf($application, $reference, $path);

$now = gmdate('c');
$agreement = lhf_add_agreement([
    'applicationId' => $application['id'],
    'applicantId' => $application['id'],
    'agreementType' => $application['type'],
    'agreementReference' => $reference,
    'policyVersion' => $application['acknowledgements'][0]['policyVersion'] ?? '1.0',
    'status' => 'GENERATED',
    'generatedPdfPathOrObjectKey' => $path,
    'generatedAt' => $now,
    'generatedByAdminId' => 'hostinger-admin',
]);
lhf_update_application_status((string)$application['id'], 'AGREEMENT_GENERATED');

lhf_json(200, ['message' => 'Agreement generated and saved for secure admin access', 'agreement' => $agreement]);
