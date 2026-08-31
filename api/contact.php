<?php
require_once __DIR__ . '/_mail.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    lhf_json(405, ['message' => 'Method not allowed']);
}

$input = json_decode((string)file_get_contents('php://input'), true) ?: [];
$_POST = array_merge($_POST, is_array($input) ? $input : []);
lhf_require(['name', 'email', 'subject', 'message']);

$sent = lhf_send_mail(
    lhf_mail_to(),
    'Website Contact - ' . lhf_value('subject'),
    "A new contact message has been submitted.\n\nName: " . lhf_value('name') . "\nEmail: " . lhf_value('email') . "\nSubject: " . lhf_value('subject') . "\n\nMessage:\n" . lhf_value('message'),
    lhf_value('email')
);

lhf_json($sent ? 200 : 500, ['message' => $sent ? 'Message sent successfully.' : 'Message could not be sent.']);
