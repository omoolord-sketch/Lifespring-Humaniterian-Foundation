<?php
require_once __DIR__ . '/_mail.php';
require_once __DIR__ . '/_storage.php';

lhf_admin_required();

$agreementId = $_GET['agreementId'] ?? '';
$agreement = lhf_find_agreement((string)$agreementId);
if (!$agreement) {
    lhf_json(404, ['message' => 'Agreement not found']);
}
if (in_array((string)($agreement['status'] ?? ''), ['SIGNED_RECEIVED', 'COMPLETED', 'VOIDED'], true)) {
    lhf_json(409, ['message' => 'This agreement cannot be resent in its current status']);
}

$application = lhf_find_application((string)$agreement['applicationId']);
if (!$application) {
    lhf_json(404, ['message' => 'Application not found']);
}

$email = (string)($application['applicantEmail'] ?? '');
if ($email === '') {
    lhf_json(400, ['message' => 'Missing applicant email']);
}

$pdfPath = (string)($agreement['generatedPdfPathOrObjectKey'] ?? '');
if ($pdfPath === '' || !is_file($pdfPath)) {
    lhf_json(404, ['message' => 'Generated agreement PDF was not found']);
}

$body = "Dear {$application['applicantName']},\n\n"
    . "Congratulations.\n\n"
    . "Your application to Lifespring Humanitarian Foundation has been approved.\n\n"
    . "Attached is your Beneficiary Agreement and Code of Conduct.\n\n"
    . "Please:\n\n"
    . "1. read the document carefully;\n"
    . "2. complete the required signature section;\n"
    . "3. sign and date the agreement;\n"
    . "4. return the signed document by email to:\n\n"
    . "info@lifespringhf.org\n\n"
    . "Please use the following subject when returning the signed document:\n\n"
    . "SIGNED AGREEMENT - {$application['reference']}\n\n"
    . "Your approved support may proceed after the signed agreement has been received and verified by Lifespring Humanitarian Foundation.\n\n"
    . "Kind regards,\n\n"
    . "Lifespring Humanitarian Foundation\n"
    . "Restoring Hope. Empowering Futures.";

$sent = lhf_send_mail($email, 'Lifespring Beneficiary Agreement - Action Required - ' . $application['reference'], $body, '', [[
    'name' => basename($pdfPath),
    'type' => 'application/pdf',
    'path' => $pdfPath,
]]);

if (!$sent) {
    lhf_update_agreement((string)$agreement['id'], ['status' => 'ERROR'], 'agreement.email_failed');
    lhf_json(503, ['message' => 'Agreement email could not be sent']);
}

$now = gmdate('c');
$updated = lhf_update_agreement((string)$agreement['id'], [
    'status' => 'SENT',
    'sentAt' => $agreement['sentAt'] ?? $now,
    'lastSentAt' => $now,
    'sendCount' => ((int)($agreement['sendCount'] ?? 0)) + 1,
], 'agreement.sent');
lhf_update_application_status((string)$application['id'], 'AGREEMENT_SENT');

lhf_send_mail(lhf_mail_to(), 'Agreement Sent - ' . $application['reference'], "Agreement sent.\n\nApplicant: {$application['applicantName']}\nApplication Reference: {$application['reference']}\nAgreement Reference: {$agreement['agreementReference']}\nApplication Type: {$agreement['agreementType']}\nDate Sent: {$now}");

lhf_json(200, ['message' => 'Agreement sent to applicant', 'agreement' => $updated]);
