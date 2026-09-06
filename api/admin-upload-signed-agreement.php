<?php
require_once __DIR__ . '/_mail.php';
require_once __DIR__ . '/_storage.php';
require_once __DIR__ . '/_agreements.php';

lhf_admin_required();

$agreement = lhf_find_agreement((string)($_GET['agreementId'] ?? ''));
if (!$agreement) {
    lhf_json(404, ['message' => 'Agreement not found']);
}

if (!isset($_FILES['signedAgreement']) || ($_FILES['signedAgreement']['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
    lhf_json(400, ['message' => 'Upload a signed agreement file']);
}

$file = $_FILES['signedAgreement'];
$name = basename((string)$file['name']);
$extension = strtolower(pathinfo($name, PATHINFO_EXTENSION));
$allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png'];
$allowedMimes = ['application/pdf', 'image/jpeg', 'image/png'];
$mime = mime_content_type((string)$file['tmp_name']) ?: '';

if (!in_array($extension, $allowedExtensions, true) || !in_array($mime, $allowedMimes, true)) {
    lhf_json(400, ['message' => 'Signed agreement must be PDF, JPG or PNG']);
}
if ((int)$file['size'] > 5 * 1024 * 1024) {
    lhf_json(400, ['message' => 'Signed agreement file is too large']);
}

$destination = lhf_signed_dir() . '/' . time() . '-' . lhf_safe_filename($name);
if (!move_uploaded_file((string)$file['tmp_name'], $destination)) {
    lhf_json(500, ['message' => 'Signed agreement upload failed']);
}

$application = lhf_find_application((string)$agreement['applicationId']);
if (!$application) {
    lhf_json(404, ['message' => 'Application not found']);
}

$now = gmdate('c');
$updated = lhf_update_agreement((string)$agreement['id'], [
    'status' => 'SIGNED_RECEIVED',
    'signedPdfPathOrObjectKey' => $destination,
    'signedDocumentPathOrSecureObjectKey' => $destination,
    'signedReceivedAt' => $now,
    'signedUploadedByAdminId' => 'hostinger-admin',
    'notes' => $_POST['note'] ?? ($agreement['notes'] ?? ''),
], 'agreement.signed_uploaded');
lhf_update_application_status((string)$application['id'], 'SIGNED_AGREEMENT_RECEIVED');

lhf_json(200, ['message' => 'Signed agreement uploaded and recorded', 'agreement' => $updated]);
