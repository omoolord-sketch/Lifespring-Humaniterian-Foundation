<?php
require_once __DIR__ . '/_mail.php';
require_once __DIR__ . '/_storage.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    lhf_json(405, ['message' => 'Method not allowed']);
}

lhf_require(['name', 'email', 'phone', 'relationship', 'category', 'details', 'desiredResolution']);
lhf_require_checks(['privacyAccepted']);

$reference = lhf_reference('LHF-CMP');
lhf_add_complaint([
    'reference' => $reference,
    'type' => 'COMPLAINT',
    'status' => 'SUBMITTED',
    'data' => [
        'name' => lhf_value('name'),
        'email' => lhf_value('email'),
        'phone' => lhf_value('phone'),
        'relationship' => lhf_value('relationship'),
        'reference' => lhf_value('reference'),
        'category' => lhf_value('category'),
        'details' => lhf_value('details'),
        'desiredResolution' => lhf_value('desiredResolution'),
    ],
]);
$body = "A new complaint has been submitted.\n\n"
    . "Complaint Reference: {$reference}\n"
    . "Name: " . lhf_value('name') . "\n"
    . "Email: " . lhf_value('email') . "\n"
    . "Phone: " . lhf_value('phone') . "\n"
    . "Relationship: " . lhf_value('relationship') . "\n"
    . "Application / Beneficiary Reference: " . lhf_value('reference') . "\n"
    . "Category: " . lhf_value('category') . "\n\n"
    . "Complaint Details:\n" . lhf_value('details') . "\n\n"
    . "Desired Resolution:\n" . lhf_value('desiredResolution');

$sent = lhf_send_mail(lhf_mail_to(), "New Complaint - {$reference}", $body, lhf_value('email'), lhf_uploaded_files(['attachment']));
lhf_json($sent ? 200 : 500, ['message' => $sent ? "Complaint submitted successfully. Reference: {$reference}" : 'Complaint could not be sent.']);
