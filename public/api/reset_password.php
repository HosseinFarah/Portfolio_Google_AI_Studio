<?php
// public/api/reset_password.php

// تنظیمات CORS (برای اینکه از پورت‌های مختلف بتونید وصل بشید)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// تنظیم اتصال به دیتابیس (اطلاعات زمپ پیش‌فرض)
$host = 'localhost';
$db   = 'portfolio_db';
$user = 'root';
$pass = '';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
    die(json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]));
}

header('Content-Type: application/json');

// اطلاعات ادمین
$email = 'h.farah61@gmail.com'; // ایمیل ادمین
$password = 'Manager12345';     // پسورد جدید

// هش کردن پسورد
$hash = password_hash($password, PASSWORD_DEFAULT);

try {
    // بررسی وجود کاربر
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $exists = $stmt->fetch();

    if ($exists) {
        // آپدیت پسورد اگر کاربر وجود دارد
        $sql = "UPDATE users SET password_hash = ? WHERE email = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$hash, $email]);
        echo json_encode(['success' => true, 'message' => 'Password UPDATED successfully for ' . $email]);
    } else {
        // ساخت کاربر جدید اگر وجود ندارد
        $sql = "INSERT INTO users (email, password_hash) VALUES (?, ?)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$email, $hash]);
        echo json_encode(['success' => true, 'message' => 'User CREATED successfully for ' . $email]);
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>