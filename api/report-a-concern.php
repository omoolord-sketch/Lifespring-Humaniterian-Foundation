<?php
require_once __DIR__ . '/_mail.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    lhf_json(405, ['message' => 'Method not allowed']);
}

lhf_require(['category', 'description', 'immediateRisk']);

$reference = lhf_reference('LHF-CON');
$body = "A new concern report has been submitted.\n\n"
    . "Concern Reference: {$reference}\n"
    . "Name: " . (lhf_value('name') ?: 'Not provided') . "\n"
    . "Email: " . (lhf_value('email') ?: 'Not provided') . "\n"
    . "Phone: " . (lhf_value('phone') ?: 'Not provided') . "\n"
    . "Relationship: " . (lhf_value('relationship') ?: 'Not provided') . "\n"
    . "Category: " . lhf_value('category') . "\n"
    . "Immediate Risk: " . lhf_value('immediateRisk') . "\n"
    . "People Involved: " . lhf_value('peopleInvolved') . "\n"
    . "Date of Incident: " . lhf_value('incidentDate') . "\n"
    . "Location: " . lhf_value('location') . "\n\n"
    . "Description:\n" . lhf_value('description');

$sent = lhf_send_mail(lhf_mail_to(), "New Concern Report - {$reference}", $body, lhf_value('email'), lhf_uploaded_files(['attachment']));
lhf_json($sent ? 200 : 500, ['message' => $sent ? "Concern submitted successfully. Reference: {$reference}" : 'Concern could not be sent.']);
