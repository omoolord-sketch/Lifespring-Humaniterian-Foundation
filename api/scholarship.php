<?php
require_once __DIR__ . '/_mail.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    lhf_json(405, ['message' => 'Method not allowed']);
}

lhf_require([
    'firstName',
    'lastName',
    'homeAddress',
    'email',
    'phone',
    'guardianName',
    'guardianEmail',
    'guardianPhone',
    'guardianOccupation',
    'guardianMonthlyIncome',
    'schoolName',
    'classLevel',
    'schoolLocation',
    'schoolPhone',
    'schoolAddress',
    'schoolContactPerson',
    'academicNeed',
]);
lhf_require_checks([
    'primarySchoolOnlyAcknowledged',
    'truthDeclaration',
    'codeOfConductAccepted',
    'verificationAcknowledged',
    'privacyPolicyAccepted',
]);
lhf_require_files(['passportPhoto', 'termResult', 'currentBill']);

$reference = lhf_reference('LHF-SCH');
$name = lhf_value('firstName') . ' ' . lhf_value('lastName');
$email = lhf_value('email');
$body = "A new scholarship application has been submitted.\n\n"
    . "Application Reference: {$reference}\n\n"
    . "APPLICANT DETAILS\n"
    . "Name: {$name}\n"
    . "Email: {$email}\n"
    . "Phone Number: " . lhf_value('phone') . "\n"
    . "Address: " . lhf_value('homeAddress') . "\n\n"
    . "PARENT / GUARDIAN DETAILS\n"
    . "Parent / Guardian Name: " . lhf_value('guardianName') . "\n"
    . "Parent / Guardian Email: " . lhf_value('guardianEmail') . "\n"
    . "Parent / Guardian Phone: " . lhf_value('guardianPhone') . "\n"
    . "Parent / Guardian Occupation: " . lhf_value('guardianOccupation') . "\n"
    . "Parent / Guardian Monthly Income: " . lhf_value('guardianMonthlyIncome') . "\n\n"
    . "SCHOOL DETAILS\n"
    . "Name of Beneficiary School: " . lhf_value('schoolName') . "\n"
    . "Current Class of Beneficiary: " . lhf_value('classLevel') . "\n"
    . "Scholarship Level: Primary school only\n"
    . "School Location: " . lhf_value('schoolLocation') . "\n"
    . "School Phone Number: " . lhf_value('schoolPhone') . "\n"
    . "School Address: " . lhf_value('schoolAddress') . "\n"
    . "School Contact Person: " . lhf_value('schoolContactPerson') . "\n\n"
    . "SCHOLARSHIP NEED SUMMARY\n"
    . lhf_value('academicNeed') . "\n";

$attachments = lhf_uploaded_files(['passportPhoto', 'termResult', 'currentBill', 'supportingDocument']);
$sent = lhf_send_mail(lhf_mail_to(), "New Scholarship Application - {$name}", $body, $email, $attachments);

if (!$sent) {
    lhf_json(500, ['message' => 'The application could not be emailed. Please contact info@lifespringhf.org.']);
}

lhf_confirmation($email, $name, $reference, 'scholarship application');
lhf_json(200, ['message' => "Application submitted successfully. Reference: {$reference}"]);
