<?php
require_once __DIR__ . '/_mail.php';
require_once __DIR__ . '/_storage.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    lhf_json(405, ['message' => 'Method not allowed']);
}

lhf_admin_required();
$records = lhf_records();
lhf_json(200, [
    'applications' => $records['applications'],
    'agreements' => $records['agreements'],
]);
