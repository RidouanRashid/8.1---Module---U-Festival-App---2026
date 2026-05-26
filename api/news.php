<?php
require_once __DIR__ . '/db.php';

$lang = in_array($_GET['lang'] ?? '', ['nl', 'en']) ? $_GET['lang'] : 'nl';
$langEsc = mysqli_real_escape_string($conn, $lang);

$result = mysqli_query($conn,
    "SELECT id, title, text, DATE_FORMAT(published_at, '%Y-%m-%dT%H:%i:%s') AS timestamp
     FROM news_items WHERE lang = '$langEsc' ORDER BY published_at DESC"
);
$items = [];
while ($row = mysqli_fetch_assoc($result)) {
    $row['id'] = (int) $row['id'];
    $items[] = $row;
}
jsonResponse($items);
