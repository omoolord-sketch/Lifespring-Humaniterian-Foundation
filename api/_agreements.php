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
    $kind = (string)($application['type'] ?? 'SCHOLARSHIP');
    $isScholarship = $kind === 'SCHOLARSHIP';
    $policyVersion = (string)(($application['acknowledgements'][0]['policyVersion'] ?? '1.0'));
    $date = gmdate('d/m/Y');
    $title = $isScholarship
        ? 'SCHOLARSHIP BENEFICIARY AGREEMENT & CODE OF CONDUCT'
        : 'COMMUNITY SUPPORT BENEFICIARY AGREEMENT & CODE OF CONDUCT';

    $doc = [
        ['type' => 'section', 'text' => 'Agreement Details'],
        ['type' => 'panel', 'fields' => [
            'Agreement Reference' => $agreementReference,
            'Application Reference' => (string)($application['reference'] ?? ''),
            'Date' => $date,
            'Policy Version' => $policyVersion,
        ]],
        ['type' => 'section', 'text' => 'Beneficiary Information'],
        ['type' => 'panel', 'fields' => lhf_beneficiary_fields($application, $data, $date, $isScholarship)],
        ['type' => 'section', 'text' => $isScholarship ? 'Approved Scholarship Support' : 'Approved Community Support'],
        ['type' => 'paragraph', 'text' => $isScholarship
            ? 'This Agreement records the scholarship approved by Lifespring Humanitarian Foundation.'
            : 'This Agreement records the community support approved by Lifespring Humanitarian Foundation.'],
        ['type' => 'panel', 'fields' => $isScholarship ? lhf_scholarship_support_fields($data) : lhf_community_support_fields($data, $date)],
        ['type' => 'paragraph', 'text' => 'The approved support shall be used solely for the purpose for which it was awarded and shall remain subject to the terms of this Agreement and the Foundation\'s applicable policies.'],
        ['type' => 'section', 'text' => 'Purpose of Agreement'],
        ['type' => 'paragraph', 'text' => $isScholarship
            ? 'This Agreement records the scholarship support approved by Lifespring Humanitarian Foundation and sets out the responsibilities of the beneficiary, parent or guardian where applicable, and the Foundation. The purpose of the Agreement is to ensure that scholarship support is administered fairly, transparently and in accordance with its intended educational purpose.'
            : 'This Agreement records the support approved by Lifespring Humanitarian Foundation and sets out the responsibilities of the beneficiary and the Foundation so that support is administered fairly, transparently and for its intended humanitarian purpose.'],
        ['type' => 'section', 'text' => 'Beneficiary Responsibilities'],
        ['type' => 'paragraph', 'text' => 'The beneficiary shall:'],
        ['type' => 'numbered', 'items' => [
            'provide truthful and accurate information at all times;',
            'use scholarship support only for the approved educational purpose;',
            'remain enrolled at the stated school or educational institution where applicable;',
            'maintain reasonable attendance and participation;',
            'cooperate with reasonable verification and monitoring by the Foundation;',
            'promptly notify the Foundation of any material change that may affect eligibility;',
            'treat Foundation representatives, school staff and other beneficiaries with respect;',
            'comply with this Agreement and the Scholarship Code of Conduct;',
            'avoid conduct involving fraud, falsification or misuse of Foundation support;',
            'return or account for funds or benefits where required following proven misuse or error, subject to applicable law and Foundation procedure.',
        ]],
    ];

    if ($isScholarship) {
        $doc[] = ['type' => 'section', 'text' => 'Parent / Guardian Responsibilities'];
        $doc[] = ['type' => 'paragraph', 'text' => 'Where a parent or guardian applies or signs on behalf of a minor beneficiary, the parent or guardian shall:'];
        $doc[] = ['type' => 'numbered', 'items' => [
            'ensure that information supplied to the Foundation is accurate;',
            'support the beneficiary\'s continued educational participation;',
            'cooperate with reasonable Foundation monitoring;',
            'notify the Foundation of material changes in school, contact details or circumstances;',
            'ensure that scholarship funds or benefits are used for the approved purpose;',
            'communicate respectfully with the Foundation and school;',
            'comply with this Agreement and the applicable Code of Conduct.',
        ]];
    }

    $doc[] = ['type' => 'section', 'text' => 'Scholarship Code of Conduct'];
    foreach (lhf_scholarship_code() as $index => $item) {
        $doc[] = ['type' => 'subsection', 'text' => ($index + 1) . '. ' . $item[0]];
        $doc[] = ['type' => 'paragraph', 'text' => $item[1]];
    }

    $doc = array_merge($doc, [
        ['type' => 'section', 'text' => 'Our Commitment to Beneficiaries'],
        ['type' => 'paragraph', 'text' => 'Lifespring Humanitarian Foundation commits to:'],
        ['type' => 'bullets', 'items' => [
            'treating beneficiaries with dignity and respect;',
            'assessing scholarship matters fairly;',
            'protecting personal information;',
            'maintaining appropriate safeguarding standards;',
            'avoiding discrimination;',
            'administering funds responsibly;',
            'considering complaints fairly;',
            'communicating important decisions reasonably and transparently;',
            'avoiding retaliation against persons who raise genuine concerns.',
        ]],
        ['type' => 'section', 'text' => 'Declaration and Acceptance'],
        ['type' => 'paragraph', 'text' => 'I/We confirm that the information supplied in connection with this scholarship is true and accurate to the best of our knowledge.'],
        ['type' => 'paragraph', 'text' => 'I/We confirm that we have read and understood this Scholarship Beneficiary Agreement and Code of Conduct and agree to comply with its terms.'],
        ['type' => 'paragraph', 'text' => 'I/We understand that scholarship support is provided for the approved educational purpose and may be reviewed where eligibility changes or where there is a serious or material breach of this Agreement.'],
        ['type' => 'paragraph', 'text' => 'I/We acknowledge our right to make a genuine complaint, raise a safeguarding concern or report suspected wrongdoing without improper retaliation.'],
        ['type' => 'section', 'text' => 'Return Instruction'],
        ['type' => 'paragraph', 'text' => 'Please sign and return the completed Agreement to info@lifespringhf.org with the email subject: SIGNED AGREEMENT - ' . (string)($application['reference'] ?? '') . '.'],
        ['type' => 'paragraph', 'text' => 'This document forms part of the official records of Lifespring Humanitarian Foundation and should be retained by both the beneficiary and the Foundation.'],
        ['type' => 'section', 'text' => 'Signatures'],
        ['type' => 'signature', 'title' => 'BENEFICIARY', 'fields' => ['Full Name', 'Signature', 'Date']],
    ]);

    if ($isScholarship) {
        $doc[] = ['type' => 'signature', 'title' => 'PARENT / GUARDIAN (where applicable)', 'fields' => ['Full Name', 'Relationship to Beneficiary', 'Signature', 'Date']];
    }
    $doc[] = ['type' => 'signature', 'title' => 'FOR LIFESPRING HUMANITARIAN FOUNDATION', 'fields' => ['Full Name', 'Position', 'Signature', 'Date']];

    lhf_write_letterhead_pdf($path, $title, $doc);
}

function lhf_beneficiary_fields(array $application, array $data, string $date, bool $isScholarship): array {
    $fields = [
        'Beneficiary' => (string)($application['applicantName'] ?? ''),
        'Email' => (string)($application['applicantEmail'] ?? ''),
        'Telephone' => (string)($application['applicantPhone'] ?? ''),
        'Address' => (string)($data['homeAddress'] ?? ''),
    ];
    if ($isScholarship) {
        $fields += [
            'Parent/Guardian' => (string)($data['guardianName'] ?? ''),
            'School' => (string)($data['schoolName'] ?? ''),
            'Class/Level' => (string)($data['classLevel'] ?? ''),
            'Academic Session' => (string)($data['academicSession'] ?? ''),
            'Scholarship Type' => 'Primary school scholarship support',
            'Approved Amount' => (string)($data['approvedAmount'] ?? ''),
            'Approved Purpose' => (string)($data['academicNeed'] ?? ''),
            'Payment Arrangement' => (string)($data['paymentArrangement'] ?? ''),
            'Date Approved' => $date,
            'Review Date' => (string)($data['reviewDate'] ?? ''),
        ];
    } else {
        $fields['Support Category'] = (string)($data['supportCategory'] ?? '');
    }
    return $fields;
}

function lhf_scholarship_support_fields(array $data): array {
    return [
        'Scholarship Type' => 'Primary school scholarship support',
        'Approved Amount / Value' => (string)($data['approvedAmount'] ?? $data['monetaryValue'] ?? ''),
        'Purpose' => (string)($data['academicNeed'] ?? ''),
        'Academic Session' => (string)($data['academicSession'] ?? ''),
        'Payment Method' => (string)($data['paymentMethod'] ?? ''),
        'Payment Recipient' => (string)($data['paymentRecipient'] ?? ''),
        'Payment Schedule' => (string)($data['paymentSchedule'] ?? ''),
        'Duration' => (string)($data['duration'] ?? ''),
        'Review Date' => (string)($data['reviewDate'] ?? ''),
    ];
}

function lhf_community_support_fields(array $data, string $date): array {
    return [
        'Approved Support' => (string)($data['supportNeeded'] ?? ''),
        'Approved Amount/Estimated Value' => (string)($data['monetaryValue'] ?? $data['approvedAmount'] ?? ''),
        'Purpose' => (string)($data['supportNeeded'] ?? ''),
        'Date Approved' => $date,
        'Delivery Date' => (string)($data['expectedDeliveryDate'] ?? ''),
        'Conditions of Support' => (string)($data['conditions'] ?? ''),
        'Foundation Representative' => 'Lifespring Representative',
    ];
}

function lhf_scholarship_code(): array {
    return [
        ['Purpose', 'This Code of Conduct establishes the standards expected of scholarship applicants, beneficiaries, parents and guardians participating in programmes supported by Lifespring Humanitarian Foundation. It is intended to promote integrity, respect, accountability, safeguarding and responsible use of Foundation support.'],
        ['Integrity and Respect', 'Beneficiaries, parents and guardians are expected to demonstrate honesty, integrity, respect, accountability and transparency in all dealings with the Foundation, its representatives, schools, partners and other beneficiaries.'],
        ['Responsible Communication', 'All communication with Lifespring Humanitarian Foundation, its representatives and partner institutions must be respectful. Beneficiaries, parents and guardians must not knowingly publish, circulate or communicate false, defamatory, malicious or deliberately misleading information about the Foundation, its representatives or programmes. Nothing in this clause prevents any person from making a genuine complaint, raising a safeguarding concern, reporting suspected misconduct, making a protected disclosure or exercising any right available under applicable law.'],
        ['Use of Foundation Name and Identity', 'The name, logo, documents, identity and reputation of Lifespring Humanitarian Foundation must not be used for unlawful, fraudulent, unethical or unauthorised purposes. No beneficiary, parent or guardian may represent themselves as an authorised representative of the Foundation unless formally authorised.'],
        ['Accurate and Truthful Information', 'All information provided in connection with an application, assessment, monitoring process or continued scholarship eligibility must be truthful, complete and accurate. Forgery, falsification, deliberate omission of material information or misrepresentation may result in review, suspension or withdrawal of support.'],
        ['Scholarship Eligibility', 'Scholarship support remains subject to the eligibility criteria of the relevant programme. The Foundation may reasonably review continued eligibility during the period of support.'],
        ['Ongoing Responsibilities', 'Beneficiaries and parents or guardians must notify the Foundation of significant changes that may affect eligibility or the administration of support, including changes of school, contact details, educational status or other relevant circumstances.'],
        ['Monitoring and Verification', 'The Foundation may reasonably verify relevant information with schools or other appropriate institutions for the purposes of scholarship administration, accountability and safeguarding, subject to applicable privacy requirements.'],
        ['Attendance and Educational Progress', 'Where applicable, beneficiaries are expected to maintain reasonable school attendance, participation and educational engagement. The Foundation may consider attendance and progress when reviewing continued scholarship support.'],
        ['Use of Scholarship Support', 'Scholarship funds, payments or benefits must be used only for the educational purpose for which they were approved. Misuse or diversion of support may result in investigation and appropriate action.'],
        ['Cooperation with Reasonable Monitoring', 'Beneficiaries, parents and guardians are expected to cooperate with reasonable requests for information, confirmation or monitoring relevant to the scholarship. Monitoring should be proportionate and respectful of privacy and safeguarding obligations.'],
        ['Safeguarding', 'The dignity, safety and welfare of children and vulnerable persons must be protected at all times. Any safeguarding concern should be reported promptly through the Foundation\'s safeguarding or reporting channels.'],
        ['Privacy and Confidentiality', 'Personal information shall be handled in accordance with the Foundation\'s Privacy and Data Protection Policy. Beneficiaries, parents and guardians must also respect confidential information obtained through participation in Foundation programmes.'],
        ['Fraud and Misrepresentation', 'Fraud, forged documents, deliberate misrepresentation, false declarations, duplicate fraudulent applications or intentional misuse of Foundation resources are prohibited. Suspected fraud may be investigated and, where appropriate, referred to relevant authorities.'],
        ['Complaints and Reporting Concerns', 'Beneficiaries, parents and guardians have the right to raise genuine complaints and concerns. Complaints should be handled fairly, respectfully and without retaliation. Safeguarding concerns, suspected misconduct, fraud or serious policy breaches may be reported through the Foundation\'s appropriate channels.'],
        ['Misconduct and Breach', 'Serious or repeated breaches of this Code may result in appropriate action. Any action taken should be proportionate to the nature and seriousness of the breach.'],
        ['Suspension or Withdrawal of Support', 'Scholarship support may be suspended, reviewed or withdrawn where there is proven fraud or deliberate misrepresentation, material breach of scholarship conditions, serious misconduct, misuse of scholarship funds or benefits, loss of programme eligibility, or other substantial reasons directly affecting the integrity or proper administration of the scholarship. Support must not be withdrawn arbitrarily.'],
        ['Review', 'Where scholarship support is suspended or withdrawn, the beneficiary or parent or guardian may request a review in accordance with the Foundation\'s applicable procedures.'],
        ['Acceptance and Acknowledgement', 'By signing this Agreement, the beneficiary and parent or guardian where applicable confirm that they have read the Agreement, understood the Code of Conduct, received an opportunity to ask questions, agreed to comply with the applicable scholarship conditions, and confirmed that information provided to the Foundation is accurate to the best of their knowledge.'],
    ];
}

function lhf_write_letterhead_pdf(string $path, string $title, array $items): void {
    $pages = [[]];
    $page = 0;
    $y = 198;
    foreach ($items as $item) {
        $height = lhf_item_height($item);
        if ($y + $height > 754) {
            $pages[] = [];
            $page++;
            $y = 82;
        }
        $pages[$page][] = $item;
        $y += $height;
    }

    $logoPath = lhf_logo_jpg_path();
    $image = $logoPath !== '' ? @getimagesize($logoPath) : false;
    $logoData = ($image && ($image['mime'] ?? '') === 'image/jpeg') ? file_get_contents($logoPath) : false;
    $logoObjectId = $logoData ? 4 + count($pages) * 2 : 0;
    $fontRegularId = $logoObjectId ? $logoObjectId + 1 : 4 + count($pages) * 2;
    $fontBoldId = $fontRegularId + 1;

    $objects = [];
    $kids = [];
    $objects[1] = '<< /Type /Catalog /Pages 2 0 R >>';
    $objects[2] = '';

    foreach ($pages as $index => $pageItems) {
        $pageId = 3 + ($index * 2);
        $contentId = $pageId + 1;
        $kids[] = "{$pageId} 0 R";
        $stream = lhf_page_stream($pageItems, $index, count($pages), $title, $logoObjectId > 0);
        $xobject = $logoObjectId > 0 ? "/XObject << /Logo {$logoObjectId} 0 R >>" : '';
        $objects[$pageId] = "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 {$fontRegularId} 0 R /F2 {$fontBoldId} 0 R >> {$xobject} >> /Contents {$contentId} 0 R >>";
        $objects[$contentId] = "<< /Length " . strlen($stream) . " >>\nstream\n{$stream}\nendstream";
    }

    $objects[2] = '<< /Type /Pages /Kids [' . implode(' ', $kids) . '] /Count ' . count($pages) . ' >>';
    if ($logoObjectId > 0 && $logoData !== false && $image !== false) {
        $objects[$logoObjectId] = "<< /Type /XObject /Subtype /Image /Width {$image[0]} /Height {$image[1]} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length " . strlen($logoData) . " >>\nstream\n{$logoData}\nendstream";
    }
    $objects[$fontRegularId] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>';
    $objects[$fontBoldId] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>';
    ksort($objects);

    $pdf = "%PDF-1.4\n";
    $offsets = [0];
    foreach ($objects as $id => $body) {
        $offsets[$id] = strlen($pdf);
        $pdf .= "{$id} 0 obj\n{$body}\nendobj\n";
    }
    $xref = strlen($pdf);
    $pdf .= "xref\n0 " . (max(array_keys($objects)) + 1) . "\n0000000000 65535 f \n";
    for ($id = 1; $id <= max(array_keys($objects)); $id++) {
        $pdf .= isset($offsets[$id]) ? sprintf("%010d 00000 n \n", $offsets[$id]) : "0000000000 65535 f \n";
    }
    $pdf .= "trailer\n<< /Size " . (max(array_keys($objects)) + 1) . " /Root 1 0 R >>\nstartxref\n{$xref}\n%%EOF";
    file_put_contents($path, $pdf, LOCK_EX);
}

function lhf_page_stream(array $items, int $pageIndex, int $pageCount, string $title, bool $hasLogo): string {
    $s = '';
    $s .= lhf_rect(0, 0, 595, 842, [1, 0.992, 0.973]);
    if ($pageIndex === 0) {
        $s .= lhf_rect(0, 0, 595, 14, [0.31, 0, 0.04]);
        if ($hasLogo) {
            $s .= lhf_image('Logo', 54, 34, 62, 62);
        }
        $s .= lhf_text('LIFESPRING HUMANITARIAN FOUNDATION', 130, 34, 17, 'F2', [0.396, 0, 0.051]);
        $s .= lhf_text('Restoring Hope. Empowering Futures.', 130, 58, 10.5, 'F1', [0.137, 0.122, 0.125]);
        $s .= lhf_text('A humanitarian and community-impact initiative of Christ Warriors', 130, 75, 9, 'F1', [0.396, 0, 0.051]);
        $s .= lhf_text('www.lifespringhf.org', 54, 108, 8.5, 'F1', [0.37, 0.357, 0.357]);
        $s .= lhf_text('info@lifespringhf.org', 246, 108, 8.5, 'F1', [0.37, 0.357, 0.357]);
        $s .= lhf_text('+2349053646313', 442, 108, 8.5, 'F1', [0.37, 0.357, 0.357]);
        $s .= lhf_text('Foundation Office: 27 Adeojo Street, Isheri, Lagos State, Nigeria', 148, 126, 8.5, 'F1', [0.37, 0.357, 0.357]);
        $s .= lhf_line(54, 148, 541, 148, [0.396, 0, 0.051], 1.4);
        $s .= lhf_line(54, 153, 541, 153, [0.788, 0.541, 0.031], 1);
        $s .= lhf_text('LIFESPRING HUMANITARIAN FOUNDATION', 108, 192, 19, 'F2', [0.31, 0, 0.04]);
        $s .= lhf_text($title, 96, 218, 17, 'F2', [0.396, 0, 0.051]);
        $s .= lhf_text('Restoring Hope. Empowering Futures.', 204, 242, 10, 'F1', [0.137, 0.122, 0.125]);
    } else {
        $s .= lhf_rect(0, 0, 595, 62, [1, 0.992, 0.973]);
        $s .= lhf_text('LIFESPRING HUMANITARIAN FOUNDATION', 54, 25, 9, 'F2', [0.396, 0, 0.051]);
        $s .= lhf_text($title, 54, 39, 8, 'F1', [0.37, 0.357, 0.357]);
        $s .= lhf_line(54, 58, 541, 58, [0.788, 0.541, 0.031], 0.8);
    }
    $y = $pageIndex === 0 ? 266 : 82;
    foreach ($items as $item) {
        $s .= lhf_draw_item($item, $y);
        $y += lhf_item_height($item);
    }

    $s .= lhf_line(54, 765, 541, 765, [0.906, 0.835, 0.678], 0.7);
    $s .= lhf_text('www.lifespringhf.org | info@lifespringhf.org | +2349053646313', 145, 775, 8, 'F1', [0.37, 0.357, 0.357]);
    $s .= lhf_text('A humanitarian and community-impact initiative of Christ Warriors', 162, 787, 8, 'F1', [0.37, 0.357, 0.357]);
    $s .= lhf_text('Page ' . ($pageIndex + 1) . ' of ' . $pageCount, 279, 800, 8, 'F1', [0.37, 0.357, 0.357]);
    return $s;
}

function lhf_draw_item(array $item, int $y): string {
    $type = (string)($item['type'] ?? 'paragraph');
    if ($type === 'section') {
        return lhf_text(strtoupper((string)$item['text']), 54, $y + 4, 12.5, 'F2', [0.396, 0, 0.051])
            . lhf_line(54, $y + 22, 170, $y + 22, [0.788, 0.541, 0.031], 1);
    }
    if ($type === 'subsection') {
        return lhf_text(strtoupper((string)$item['text']), 54, $y + 2, 10.2, 'F2', [0.31, 0, 0.04]);
    }
    if ($type === 'panel') {
        $fields = lhf_filter_fields($item['fields'] ?? []);
        $height = lhf_item_height($item);
        $s = lhf_rect(54, $y, 487, $height - 12, [1, 0.984, 0.949], [0.906, 0.835, 0.678]);
        $rowY = $y + 14;
        foreach ($fields as $label => $value) {
            $s .= lhf_text($label . ':', 70, $rowY, 9.2, 'F2', [0.396, 0, 0.051]);
            $s .= lhf_text((string)$value, 232, $rowY, 9.2, 'F1', [0.137, 0.122, 0.125]);
            $rowY += 18;
        }
        return $s;
    }
    if ($type === 'numbered' || $type === 'bullets') {
        $s = '';
        $rowY = $y;
        foreach (($item['items'] ?? []) as $index => $line) {
            $prefix = $type === 'numbered' ? ($index + 1) . '. ' : '- ';
            foreach (lhf_wrap_text($prefix . (string)$line, 92) as $wrapped) {
                $s .= lhf_text($wrapped, 62, $rowY, 9.4, 'F1', [0.137, 0.122, 0.125]);
                $rowY += 13;
            }
            $rowY += 2;
        }
        return $s;
    }
    if ($type === 'signature') {
        $s = lhf_text((string)$item['title'], 54, $y, 10, 'F2', [0.31, 0, 0.04]);
        $rowY = $y + 20;
        foreach (($item['fields'] ?? []) as $field) {
            $s .= lhf_text((string)$field . ': ______________________________________________', 54, $rowY, 9.7, 'F1', [0.137, 0.122, 0.125]);
            $rowY += 20;
        }
        return $s;
    }

    $s = '';
    foreach (lhf_wrap_text((string)($item['text'] ?? ''), 94) as $index => $line) {
        $s .= lhf_text($line, 54, $y + ($index * 13), 9.4, 'F1', [0.137, 0.122, 0.125]);
    }
    return $s;
}

function lhf_item_height(array $item): int {
    $type = (string)($item['type'] ?? 'paragraph');
    if ($type === 'section') return 42;
    if ($type === 'subsection') return 24;
    if ($type === 'panel') return 28 + count(lhf_filter_fields($item['fields'] ?? [])) * 18;
    if ($type === 'signature') return 28 + count($item['fields'] ?? []) * 20 + 12;
    if ($type === 'numbered' || $type === 'bullets') {
        $lines = 0;
        foreach (($item['items'] ?? []) as $index => $line) {
            $prefix = $type === 'numbered' ? ($index + 1) . '. ' : '- ';
            $lines += count(lhf_wrap_text($prefix . (string)$line, 92)) + 1;
        }
        return max(28, $lines * 13);
    }
    return 18 + count(lhf_wrap_text((string)($item['text'] ?? ''), 94)) * 13;
}

function lhf_filter_fields(array $fields): array {
    $filtered = [];
    foreach ($fields as $label => $value) {
        $clean = trim((string)$value);
        if ($clean !== '' && !in_array($clean, ['undefined', 'null', 'N/A', '[object Object]'], true)) {
            $filtered[$label] = $clean;
        }
    }
    return $filtered;
}

function lhf_logo_jpg_path(): string {
    foreach ([__DIR__ . '/../lifespring-emblem-letterhead.jpg', __DIR__ . '/../public/lifespring-emblem-letterhead.jpg'] as $path) {
        if (is_file($path)) return $path;
    }
    return '';
}

function lhf_wrap_text(string $text, int $width): array {
    return explode("\n", wordwrap($text, $width, "\n", true));
}

function lhf_text(string $text, int $x, int $top, float $size, string $font, array $rgb): string {
    $y = 842 - $top - $size;
    return "BT\n{$font} {$size} Tf\n" . lhf_rgb($rgb) . " rg\n1 0 0 1 {$x} {$y} Tm\n(" . lhf_pdf_escape($text) . ") Tj\nET\n";
}

function lhf_line(int $x1, int $top1, int $x2, int $top2, array $rgb, float $width): string {
    $y1 = 842 - $top1;
    $y2 = 842 - $top2;
    return lhf_rgb($rgb) . " RG\n{$width} w\n{$x1} {$y1} m\n{$x2} {$y2} l\nS\n";
}

function lhf_rect(int $x, int $top, int $w, int $h, array $fill, ?array $stroke = null): string {
    $y = 842 - $top - $h;
    $s = lhf_rgb($fill) . " rg\n";
    if ($stroke !== null) {
        $s .= lhf_rgb($stroke) . " RG\n{$x} {$y} {$w} {$h} re\nB\n";
    } else {
        $s .= "{$x} {$y} {$w} {$h} re\nf\n";
    }
    return $s;
}

function lhf_image(string $name, int $x, int $top, int $w, int $h): string {
    $y = 842 - $top - $h;
    return "q\n{$w} 0 0 {$h} {$x} {$y} cm\n/{$name} Do\nQ\n";
}

function lhf_rgb(array $rgb): string {
    return sprintf('%.3F %.3F %.3F', $rgb[0], $rgb[1], $rgb[2]);
}

function lhf_pdf_escape(string $value): string {
    return str_replace(['\\', '(', ')'], ['\\\\', '\(', '\)'], $value);
}
