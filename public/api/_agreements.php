<?php
declare(strict_types=1);

function lhf_agreements_dir(): string {
    $dir = __DIR__ . '/data/agreements';
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
    return $dir;
}

function lhf_signed_dir(): string {
    $dir = __DIR__ . '/data/signed-agreements';
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
    return $dir;
}

function lhf_safe_filename(string $value): string {
    return preg_replace('/[^A-Za-z0-9_.-]/', '_', $value) ?: 'document';
}

function lhf_agreement_filename(array $application): string {
    $reference = lhf_safe_filename((string)($application['reference'] ?? 'APPLICATION'));
    return ($application['type'] ?? '') === 'SCHOLARSHIP'
        ? "Lifespring_Scholarship_Beneficiary_Agreement_{$reference}.pdf"
        : "Lifespring_Community_Support_Beneficiary_Agreement_{$reference}.pdf";
}

function lhf_generate_agreement_pdf(array $application, string $agreementReference, string $path): void {
    $data = is_array($application['data'] ?? null) ? $application['data'] : [];
    $title = ($application['type'] ?? '') === 'SCHOLARSHIP'
        ? 'SCHOLARSHIP BENEFICIARY AGREEMENT & CODE OF CONDUCT'
        : 'COMMUNITY SUPPORT BENEFICIARY AGREEMENT & CODE OF CONDUCT';
    $lines = [
        'LIFESPRING HUMANITARIAN FOUNDATION',
        'Restoring Hope. Empowering Futures.',
        'A humanitarian and community-impact initiative of Christ Warriors',
        'www.lifespringhf.org | info@lifespringhf.org | +2349053646313',
        '27 Adeojo Street, Isheri, Lagos State, Nigeria',
        '',
        $title,
        '',
        'Agreement Reference: ' . $agreementReference,
        'Application Reference: ' . (string)($application['reference'] ?? ''),
        'Date: ' . gmdate('d/m/Y'),
        'Policy Version: ' . (string)(($application['acknowledgements'][0]['policyVersion'] ?? '1.0')),
        '',
        'BENEFICIARY INFORMATION',
        'Beneficiary: ' . (string)($application['applicantName'] ?? ''),
        'Email: ' . (string)($application['applicantEmail'] ?? ''),
        'Telephone: ' . (string)($application['applicantPhone'] ?? ''),
        'Address: ' . (string)($data['homeAddress'] ?? ''),
    ];

    if (($application['type'] ?? '') === 'SCHOLARSHIP') {
        $lines = array_merge($lines, [
            'Parent/Guardian: ' . (string)($data['guardianName'] ?? ''),
            'School: ' . (string)($data['schoolName'] ?? ''),
            'Class/Level: ' . (string)($data['classLevel'] ?? ''),
            'Scholarship Type: Primary school scholarship support',
            'Purpose: ' . (string)($data['academicNeed'] ?? ''),
        ]);
    } else {
        $lines = array_merge($lines, [
            'Support Category: ' . (string)($data['supportCategory'] ?? ''),
            'Approved Support: ' . (string)($data['supportNeeded'] ?? ''),
            'Purpose: ' . (string)($data['supportNeeded'] ?? ''),
        ]);
    }

    $conduct = ($application['type'] ?? '') === 'SCHOLARSHIP'
        ? ['Purpose', 'Integrity and Respect', 'Responsible Communication', 'Use of Foundation Name and Identity', 'Accurate and Truthful Information', 'Scholarship Eligibility', 'Ongoing Responsibilities', 'Monitoring and Verification', 'Attendance and Educational Progress where applicable', 'Use of Scholarship Support', 'Cooperation with Reasonable Monitoring', 'Safeguarding', 'Privacy and Confidentiality', 'Fraud and Misrepresentation', 'Complaints and Reporting Concerns', 'Misconduct and Breach', 'Suspension or Withdrawal of Support', 'Review', 'Acceptance and Acknowledgement']
        : ['Purpose', 'Honesty and Accurate Information', 'Dignity and Mutual Respect', 'Eligibility Information', 'Supporting Documents', 'No Forged or Falsified Documents', 'No Duplicate or Fraudulent Applications', 'No Bribery or Inducement', 'Proper Use of Approved Assistance', 'Reasonable Verification', 'Responsible Communication', 'No Harassment, Threats or Abuse', 'No Impersonation', 'No Misuse of Lifespring Name or Logo', 'Confidentiality', 'Safeguarding', 'Complaints and Feedback', 'Fraud and Misconduct', 'Suspension or Withdrawal', 'Review', 'Acceptance'];

    $lines = array_merge($lines, [
        '',
        'PURPOSE',
        'This agreement records the approved support and the responsibilities that keep Lifespring support fair, accountable and focused on its intended purpose.',
        '',
        'BENEFICIARY RESPONSIBILITIES',
        'The beneficiary will provide truthful information, use support only for the approved purpose, cooperate with reasonable verification and communicate respectfully.',
        '',
        'CODE OF CONDUCT',
    ]);

    foreach ($conduct as $index => $item) {
        $lines[] = ($index + 1) . '. ' . $item;
    }

    $lines = array_merge($lines, [
        '',
        'Lifespring commits to dignity, fairness, confidentiality, safeguarding, non-discrimination, responsible handling of personal information, fair consideration of complaints and reasonable transparency.',
        'Nothing in this Code prevents any beneficiary, parent or guardian from making a genuine complaint, raising a safeguarding concern, reporting suspected misconduct or exercising any right available under applicable law.',
        '',
        'This document forms part of the official records of Lifespring Humanitarian Foundation and should be retained by both the beneficiary and the Foundation.',
        'Please sign and return the completed document to: info@lifespringhf.org',
        '',
        'SIGNATURES',
        'BENEFICIARY',
        'Name: ______________________________',
        'Signature: ___________________________',
        'Date: _______________________________',
    ]);

    if (($application['type'] ?? '') === 'SCHOLARSHIP') {
        $lines = array_merge($lines, [
            '',
            'PARENT/GUARDIAN (where applicable)',
            'Name: ______________________________',
            'Relationship: ________________________',
            'Signature: ___________________________',
            'Date: _______________________________',
        ]);
    }

    $lines = array_merge($lines, [
        '',
        'FOR LIFESPRING HUMANITARIAN FOUNDATION',
        'Name: ______________________________',
        'Position: ____________________________',
        'Signature: ___________________________',
        'Date: _______________________________',
    ]);

    lhf_write_simple_pdf($path, $lines);
}

function lhf_write_simple_pdf(string $path, array $lines): void {
    $pages = array_chunk(lhf_wrap_lines($lines, 86), 45);
    $objects = [];
    $kids = [];
    $fontId = 3 + count($pages) * 2;

    $objects[1] = '<< /Type /Catalog /Pages 2 0 R >>';
    $objects[2] = '';

    foreach ($pages as $index => $pageLines) {
        $pageId = 3 + ($index * 2);
        $contentId = $pageId + 1;
        $kids[] = "{$pageId} 0 R";
        $stream = "BT\n/F1 10 Tf\n50 790 Td\n14 TL\n";
        foreach ($pageLines as $line) {
            $stream .= '(' . lhf_pdf_escape($line) . ") Tj\n0 -14 Td\n";
        }
        $stream .= "ET";
        $objects[$pageId] = "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 {$fontId} 0 R >> >> /Contents {$contentId} 0 R >>";
        $objects[$contentId] = "<< /Length " . strlen($stream) . " >>\nstream\n{$stream}\nendstream";
    }

    $objects[2] = '<< /Type /Pages /Kids [' . implode(' ', $kids) . '] /Count ' . count($pages) . ' >>';
    $objects[$fontId] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>';
    ksort($objects);

    $pdf = "%PDF-1.4\n";
    $offsets = [0];
    foreach ($objects as $id => $body) {
        $offsets[$id] = strlen($pdf);
        $pdf .= "{$id} 0 obj\n{$body}\nendobj\n";
    }
    $xref = strlen($pdf);
    $pdf .= "xref\n0 " . (count($objects) + 1) . "\n0000000000 65535 f \n";
    foreach (array_keys($objects) as $id) {
        $pdf .= sprintf("%010d 00000 n \n", $offsets[$id]);
    }
    $pdf .= "trailer\n<< /Size " . (count($objects) + 1) . " /Root 1 0 R >>\nstartxref\n{$xref}\n%%EOF";
    file_put_contents($path, $pdf, LOCK_EX);
}

function lhf_wrap_lines(array $lines, int $width): array {
    $wrapped = [];
    foreach ($lines as $line) {
        if ($line === '') {
            $wrapped[] = '';
            continue;
        }
        foreach (explode("\n", wordwrap((string)$line, $width, "\n", true)) as $part) {
            $wrapped[] = $part;
        }
    }
    return $wrapped;
}

function lhf_pdf_escape(string $value): string {
    return str_replace(['\\', '(', ')'], ['\\\\', '\(', '\)'], $value);
}
