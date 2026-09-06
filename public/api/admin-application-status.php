<?php
require_once __DIR__ . '/_mail.php';
require_once __DIR__ . '/_storage.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    lhf_json(405, ['message' => 'Method not allowed']);
}

lhf_admin_required();
$input = json_decode((string)file_get_contents('php://input'), true) ?: [];
$applicationId = trim((string)($input['applicationId'] ?? $_POST['applicationId'] ?? ''));
$status = trim((string)($input['status'] ?? $_POST['status'] ?? ''));
$allowed = ['SUBMITTED', 'UNDER_REVIEW', 'MORE_INFORMATION_REQUIRED', 'APPROVED_PENDING_AGREEMENT', 'AGREEMENT_GENERATED', 'AGREEMENT_SENT', 'AGREEMENT_VIEWED', 'SIGNED_AGREEMENT_RECEIVED', 'SUPPORT_READY_FOR_RELEASE', 'COMPLETED', 'DECLINED', 'SUSPENDED', 'WITHDRAWN'];

if ($applicationId === '' || !in_array($status, $allowed, true)) {
    lhf_json(400, ['message' => 'Invalid status update']);
}

$application = lhf_update_application_status($applicationId, $status);
if (!$application) {
    lhf_json(404, ['message' => 'Application not found']);
}

lhf_json(200, ['message' => 'Application status updated', 'application' => $application]);
