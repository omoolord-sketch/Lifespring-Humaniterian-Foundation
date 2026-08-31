<?php
require_once __DIR__ . '/_mail.php';
require_once __DIR__ . '/_storage.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    lhf_json(405, ['message' => 'Method not allowed']);
}

lhf_require(['firstName', 'lastName', 'email', 'phone', 'supportCategory', 'location', 'homeAddress', 'supportNeeded']);
lhf_require_checks(['truthDeclaration', 'codeOfConductAccepted', 'verificationAcknowledged', 'privacyPolicyAccepted']);

$reference = lhf_reference('LHF-CSP');
$name = lhf_value('firstName') . ' ' . lhf_value('lastName');
$email = lhf_value('email');
$application = lhf_add_application([
    'reference' => $reference,
    'type' => 'COMMUNITY_SUPPORT',
    'applicantName' => $name,
    'applicantEmail' => $email,
    'applicantPhone' => lhf_value('phone'),
    'status' => 'SUBMITTED',
    'data' => [
        'firstName' => lhf_value('firstName'),
        'lastName' => lhf_value('lastName'),
        'email' => $email,
        'phone' => lhf_value('phone'),
        'supportCategory' => lhf_value('supportCategory'),
        'location' => lhf_value('location'),
        'homeAddress' => lhf_value('homeAddress'),
        'supportNeeded' => lhf_value('supportNeeded'),
    ],
    'acknowledgements' => [
        ['policyId' => lhf_value('communityCodePolicyId') ?: 'COMMUNITY_SUPPORT_CODE', 'policyVersion' => lhf_value('communityCodePolicyVersion') ?: '1.0', 'declaration' => 'truthDeclaration', 'accepted' => true, 'acceptedAt' => gmdate('c')],
        ['policyId' => lhf_value('communityCodePolicyId') ?: 'COMMUNITY_SUPPORT_CODE', 'policyVersion' => lhf_value('communityCodePolicyVersion') ?: '1.0', 'declaration' => 'codeOfConductAccepted', 'accepted' => true, 'acceptedAt' => gmdate('c')],
        ['policyId' => lhf_value('communityCodePolicyId') ?: 'COMMUNITY_SUPPORT_CODE', 'policyVersion' => lhf_value('communityCodePolicyVersion') ?: '1.0', 'declaration' => 'verificationAcknowledged', 'accepted' => true, 'acceptedAt' => gmdate('c')],
        ['policyId' => lhf_value('privacyPolicyId') ?: 'PRIVACY', 'policyVersion' => lhf_value('privacyPolicyVersion') ?: '1.0', 'declaration' => 'privacyPolicyAccepted', 'accepted' => true, 'acceptedAt' => gmdate('c')],
    ],
]);
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
