<?php
require_once __DIR__ . '/_mail.php';
require_once __DIR__ . '/_storage.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    lhf_json(405, ['message' => 'Method not allowed']);
}

lhf_admin_required();
$input = json_decode((string)file_get_contents('php://input'), true) ?: [];
$type = strtoupper(trim((string)($input['type'] ?? '')));
$applicantName = trim((string)($input['applicantName'] ?? ''));
$applicantEmail = trim((string)($input['applicantEmail'] ?? ''));

if (!in_array($type, ['SCHOLARSHIP', 'COMMUNITY_SUPPORT'], true)) {
    lhf_json(400, ['message' => 'Choose a valid application type']);
}
if ($applicantName === '' || $applicantEmail === '') {
    lhf_json(400, ['message' => 'Applicant name and email are required']);
}

$reference = trim((string)($input['reference'] ?? ''));
if ($reference === '') {
    $reference = lhf_reference($type === 'SCHOLARSHIP' ? 'LHF-SCH-LEGACY' : 'LHF-CSP-LEGACY');
}

$records = lhf_records();
foreach ($records['applications'] as $existing) {
    if (($existing['reference'] ?? '') === $reference) {
        lhf_json(409, ['message' => 'An application with this reference already exists']);
    }
}

$summary = trim((string)($input['summary'] ?? ''));
$application = lhf_add_application([
    'reference' => $reference,
    'type' => $type,
    'applicantName' => $applicantName,
    'applicantEmail' => $applicantEmail,
    'applicantPhone' => trim((string)($input['applicantPhone'] ?? '')),
    'status' => 'SUBMITTED',
    'data' => [
        'importedLegacyApplication' => 'yes',
        'originalSubmittedAt' => trim((string)($input['originalSubmittedAt'] ?? '')),
        'summary' => $summary,
        'schoolName' => trim((string)($input['schoolName'] ?? '')),
        'classLevel' => trim((string)($input['classLevel'] ?? '')),
        'supportCategory' => trim((string)($input['supportCategory'] ?? '')),
        'academicNeed' => $type === 'SCHOLARSHIP' ? $summary : '',
        'supportNeeded' => $type === 'COMMUNITY_SUPPORT' ? $summary : '',
    ],
    'acknowledgements' => [
        [
            'policyId' => $type === 'SCHOLARSHIP' ? 'SCHOLARSHIP_CODE' : 'COMMUNITY_SUPPORT_CODE',
            'policyVersion' => '1.0',
            'declaration' => 'legacy_application_imported_from_email_record',
            'accepted' => true,
            'acceptedAt' => gmdate('c'),
        ],
    ],
]);

$records = lhf_records();
lhf_audit($records, 'application.legacy_imported', 'application', (string)$application['id'], [
    'reference' => $application['reference'] ?? '',
    'type' => $application['type'] ?? '',
    'originalSubmittedAt' => trim((string)($input['originalSubmittedAt'] ?? '')),
]);
lhf_save_records($records);

lhf_json(200, ['message' => 'Legacy application imported', 'application' => $application]);
