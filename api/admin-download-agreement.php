<?php
require_once __DIR__ . '/_mail.php';
require_once __DIR__ . '/_storage.php';

lhf_admin_required();

$agreement = lhf_find_agreement((string)($_GET['agreementId'] ?? ''));
if (!$agreement) {
    lhf_json(404, ['message' => 'Agreement not found']);
}

$path = (string)($agreement['generatedPdfPathOrObjectKey'] ?? '');
if ($path === '' || !is_file($path)) {
    lhf_json(404, ['message' => 'Agreement PDF was not found']);
}

lhf_update_agreement((string)$agreement['id'], [], 'agreement.downloaded');
header('Content-Type: application/pdf');
header('Content-Disposition: attachment; filename="' . basename($path) . '"');
header('Content-Length: ' . filesize($path));
readfile($path);
exit;
