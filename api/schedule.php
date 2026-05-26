<?php
require_once __DIR__ . '/db.php';

$daysResult = mysqli_query($conn, 'SELECT day_key, event_date FROM schedule_days ORDER BY event_date');
$schedule = [];
while ($day = mysqli_fetch_assoc($daysResult)) {
    $schedule[$day['day_key']] = ['date' => $day['event_date'], 'stages' => []];
}

$slotsResult = mysqli_query($conn,
    'SELECT sa.day_key, sa.stage_id, sa.act_code, sa.artist_name,
            sa.start_time, sa.end_time, sa.genre,
            ss.stage_name, ss.sort_order AS stage_order
     FROM schedule_acts sa
     JOIN schedule_stages ss ON ss.day_key = sa.day_key AND ss.stage_id = sa.stage_id
     ORDER BY sa.day_key, ss.sort_order, sa.start_time'
);

while ($slot = mysqli_fetch_assoc($slotsResult)) {
    $day     = $slot['day_key'];
    $stageId = $slot['stage_id'];

    if (!isset($schedule[$day]['stages'][$stageId])) {
        $schedule[$day]['stages'][$stageId] = [
            'id'   => $stageId,
            'name' => $slot['stage_name'],
            'acts' => [],
        ];
    }

    $schedule[$day]['stages'][$stageId]['acts'][] = [
        'id'     => $slot['act_code'],
        'artist' => $slot['artist_name'],
        'start'  => substr($slot['start_time'], 0, 5),
        'end'    => substr($slot['end_time'], 0, 5),
        'genre'  => $slot['genre'],
    ];
}

foreach ($schedule as &$dayData) {
    $dayData['stages'] = array_values($dayData['stages']);
}

jsonResponse($schedule);
