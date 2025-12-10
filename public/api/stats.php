<?php
require_once 'cors.php';
require_once 'db_connect.php';

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

// --- GET: Fetch stats ---
if ($method === 'GET') {
    // Get last 30 days
    $stmt = $pdo->query("SELECT visit_date as date, visits FROM stats ORDER BY visit_date ASC LIMIT 30");
    echo json_encode($stmt->fetchAll());
    exit();
}

// --- POST: Record Visit ---
if ($method === 'POST') {
    $today = date('Y-m-d');
    $stmt = $pdo->prepare("INSERT INTO stats (visit_date, visits) VALUES (?, 1) ON DUPLICATE KEY UPDATE visits = visits + 1");
    $stmt->execute([$today]);
    echo json_encode(['success' => true]);
    exit();
}
?>