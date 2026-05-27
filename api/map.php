<?php
require_once __DIR__ . '/db.php';

$cfg = mysqli_fetch_assoc(mysqli_query($conn, 'SELECT * FROM map_settings WHERE id = 1'));

$result = mysqli_query($conn, 'SELECT stage_name, color, lat, lng FROM map_stages ORDER BY sort_order');
$stages = [];
while ($row = mysqli_fetch_assoc($result)) {
    $stages[] = [
        'name'  => $row['stage_name'],
        'color' => $row['color'],
        'lat'   => (float) $row['lat'],
        'lng'   => (float) $row['lng'],
    ];
}

$fResult = mysqli_query($conn, 'SELECT type, lat, lng FROM map_facilities ORDER BY sort_order');
$facilities = [];
while ($row = mysqli_fetch_assoc($fResult)) {
    $facilities[] = [
        'type' => $row['type'],
        'lat'  => (float) $row['lat'],
        'lng'  => (float) $row['lng'],
    ];
}

jsonResponse([
    'center'     => [(float) $cfg['center_lat'], (float) $cfg['center_lng']],
    'zoom'       => (int) $cfg['zoom_level'],
    'bounds'     => ['top' => 52.0630, 'bottom' => 52.0578, 'left' => 5.0490, 'right' => 5.0568],
    'stages'     => $stages,
    'facilities' => $facilities,
]);
