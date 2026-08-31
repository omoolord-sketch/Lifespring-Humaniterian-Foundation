<?php
require_once __DIR__ . '/_mail.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    lhf_json(405, ['message' => 'Method not allowed']);
}

lhf_require(['firstName', 'lastName', 'email', 'phone', 'supportCategory', 'location', 'homeAddress', 'supportNeeded']);
lhf_require_checks(['truthDeclaration', 'codeOfConductAccepted', 'verificationAcknowledged', 'privacyPolicyAccepted']);

$reference = lhf_reference('LHF-CSP');
$name = lhf_value('firstName') . ' ' . lhf_value('lastName');
$email = lhf_value('email');
$body = "A new community support application has been submitted.\n\n"
    . "Application Reference: {$reference}\n"
    . "Name: {$name}\n"
    . "Email: {$email}\n"
    . "Phone Number: " . lhf_value('phone') . "\n"
    . "Support Category: " . lhf_value('supportCategory') . "\n"
    . "Location: " . lhf_value('location') . "\n"
    . "Home Address: " . lhf_value('homeAddress') . "\n\n"
    . "SUPPORT REQUEST\n" . lhf_value('supportNeeded') . "\n";

$sent = lhf_send_mail(lhf_mail_to(), "New Community Support Application - {$name}", $body, $email);
if (!$sent) {
    lhf_json(500, ['message' => 'The support request could not be emailed. Please contact info@lifespringhf.org.']);
}

lhf_confirmation($email, $name, $reference, 'community support application');
lhf_json(200, ['message' => "Support request submitted successfully. Reference: {$reference}"]);
