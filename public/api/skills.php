<?php
require_once 'cors.php';
require_once 'db_connect.php';

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

// --- GET ---
if ($method === 'GET') {
    $stmt = $pdo->query("SELECT * FROM skills ORDER BY id ASC");
    $skills = $stmt->fetchAll();
    // Map snake_case DB columns to camelCase JS props
    foreach ($skills as &$s) {
        $s['iconClass'] = $s['icon_class'];
        $s['imageUrl'] = $s['image_url'];
    }
    echo json_encode($skills);
    exit();
}

// --- POST ---
if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    $name = $input['name'];
    $category = $input['category'];
    $iconClass = $input['iconClass'] ?? '';
    $imageUrl = $input['imageUrl'] ?? '';

    if (!empty($input['id'])) {
        $stmt = $pdo->prepare("UPDATE skills SET name=?, category=?, icon_class=?, image_url=? WHERE id=?");
        $stmt->execute([$name, $category, $iconClass, $imageUrl, $input['id']]);
    } else {
        $stmt = $pdo->prepare("INSERT INTO skills (name, category, icon_class, image_url) VALUES (?, ?, ?, ?)");
        $stmt->execute([$name, $category, $iconClass, $imageUrl]);
    }
    
    echo json_encode(['success' => true]);
    exit();
}

// --- DELETE ---
if ($method === 'DELETE') {
    $id = $_GET['id'] ?? null;
    if ($id) {
        $stmt = $pdo->prepare("DELETE FROM skills WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['success' => true]);
    }
    exit();
}
?>