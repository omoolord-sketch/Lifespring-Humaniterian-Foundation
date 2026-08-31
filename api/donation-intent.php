<?php
require_once __DIR__ . '/_mail.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    lhf_json(405, ['message' => 'Method not allowed']);
}

$input = json_decode((string)file_get_contents('php://input'), true) ?: [];
$_POST = array_merge($_POST, is_array($input) ? $input : []);
lhf_require(['name', 'email', 'supportArea', 'amount']);

$sent = lhf_send_mail(
    lhf_mail_to(),
    'Donation Pledge - ' . lhf_value('supportArea'),
    "A new donation pledge has been submitted.\n\nName: " . lhf_value('name') . "\nEmail: " . lhf_value('email') . "\nSupport Area: " . lhf_value('supportArea') . "\nAmount: " . lhf_value('amount'),
    lhf_value('email')
);

lhf_json($sent ? 200 : 500, ['message' => $sent ? 'Donation pledge submitted successfully.' : 'Donation pledge could not be sent.']);
