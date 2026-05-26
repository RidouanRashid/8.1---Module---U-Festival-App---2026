<?php
require_once __DIR__ . '/db.php';

$lang = in_array($_GET['lang'] ?? '', ['nl', 'en']) ? $_GET['lang'] : 'nl';
$langEsc = mysqli_real_escape_string($conn, $lang);

$result = mysqli_query($conn,
    "SELECT section_key, title, content FROM info_sections WHERE lang = '$langEsc' ORDER BY sort_order"
);
$rawSections = [];
while ($row = mysqli_fetch_assoc($result)) {
    $rawSections[] = $row;
}

$sectionKeys   = array_column($rawSections, 'section_key');
$subsectionMap = [];
$faqMap        = [];

if ($sectionKeys) {
    $keys = implode(',', array_map(fn($k) => "'" . mysqli_real_escape_string($conn, $k) . "'", $sectionKeys));

    $subResult = mysqli_query($conn,
        "SELECT section_key, subsection_title AS title, subsection_content AS content
         FROM info_subsections
         WHERE section_key IN ($keys) AND lang = '$langEsc'
         ORDER BY section_key, sort_order"
    );
    while ($row = mysqli_fetch_assoc($subResult)) {
        $subsectionMap[$row['section_key']][] = ['title' => $row['title'], 'content' => $row['content']];
    }

    $faqResult = mysqli_query($conn,
        "SELECT section_key, question, answer
         FROM info_faq
         WHERE section_key IN ($keys) AND lang = '$langEsc'
         ORDER BY section_key, sort_order"
    );
    while ($row = mysqli_fetch_assoc($faqResult)) {
        $faqMap[$row['section_key']][] = ['question' => $row['question'], 'answer' => $row['answer']];
    }
}

$sections = [];
foreach ($rawSections as $s) {
    $key     = $s['section_key'];
    $section = ['id' => $key, 'title' => $s['title']];

    if (isset($subsectionMap[$key])) {
        $section['subsections'] = $subsectionMap[$key];
    } elseif (isset($faqMap[$key])) {
        $section['questions'] = $faqMap[$key];
    } else {
        $section['content'] = $s['content'];
    }

    $sections[] = $section;
}

jsonResponse(['sections' => $sections]);
