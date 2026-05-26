<?php
require_once __DIR__ . '/db.php';

if (!empty($_GET['id'])) {
    $id = mysqli_real_escape_string($conn, $_GET['id']);
    $result = mysqli_query($conn, "SELECT id, name, genre, description_nl, description_en, youtube FROM artists WHERE id = '$id'");
    $act = mysqli_fetch_assoc($result);
    if (!$act) errorResponse('Act not found', 404);
    jsonResponse($act);
}

$result = mysqli_query($conn, 'SELECT id, name, genre, description_nl, description_en, youtube FROM artists ORDER BY name');
$acts = [];
while ($row = mysqli_fetch_assoc($result)) {
    $acts[] = $row;
}
jsonResponse($acts);
