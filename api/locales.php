<?php
require_once __DIR__ . '/db.php';

function setNestedValue(&$target, $path, $value) {
    $parts = explode('.', $path);
    $node = &$target;
    foreach ($parts as $part) {
        if (!isset($node[$part]) || !is_array($node[$part])) {
            $node[$part] = [];
        }
        $node = &$node[$part];
    }
    $node = $value;
}

$lang = $_GET['lang'] ?? null;
$langs = ['nl', 'en'];

if ($lang !== null) {
    if (!in_array($lang, $langs, true)) {
        errorResponse('Invalid language', 400);
    }
    $langEsc = mysqli_real_escape_string($conn, $lang);
    $result = mysqli_query($conn, "SELECT key_path, text_value FROM ui_translations WHERE lang = '$langEsc' ORDER BY key_path");

    $messages = [];
    while ($row = mysqli_fetch_assoc($result)) {
        setNestedValue($messages, $row['key_path'], $row['text_value']);
    }

    jsonResponse($messages);
}

$result = mysqli_query($conn, "SELECT lang, key_path, text_value FROM ui_translations WHERE lang IN ('nl','en') ORDER BY lang, key_path");
$out = ['nl' => [], 'en' => []];

while ($row = mysqli_fetch_assoc($result)) {
    setNestedValue($out[$row['lang']], $row['key_path'], $row['text_value']);
}

jsonResponse($out);
