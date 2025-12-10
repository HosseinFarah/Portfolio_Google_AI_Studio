<?php
// public/api/settings.php

require_once 'cors.php';
require_once 'db_connect.php';

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

// Helper function to save Base64 image to server storage
function uploadImage($base64_string, $prefix) {
    // If it's already a URL (not base64 data), return it as is
    if (strpos($base64_string, 'data:image') === false) {
        return $base64_string;
    }

    // Target directory: ../uploads/ (relative to public/api/)
    $target_dir = "../uploads/";
    
    // Create directory if it doesn't exist
    if (!file_exists($target_dir)) {
        mkdir($target_dir, 0777, true);
    }

    // Split the base64 string
    // Format: "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
    $data = explode(',', $base64_string);
    
    // Decode
    $decoded_data = base64_decode($data[1]);
    
    // Generate unique filename
    $filename = $prefix . '_' . time() . '.jpg';
    $file_path = $target_dir . $filename;
    
    // Save file
    if (file_put_contents($file_path, $decoded_data) === false) {
        return ''; // Return empty string if saving fails
    }
    
    // Return the relative path to be stored in DB and used by frontend
    // Adjusted to return 'uploads/filename'
    return 'uploads/' . $filename; 
}

// --- GET Settings ---
if ($method === 'GET') {
    try {
        $stmt = $pdo->query("SELECT * FROM settings WHERE id = 1");
        $row = $stmt->fetch();
        
        if (!$row) {
            echo json_encode([]); 
            exit();
        }

        $settings = [
            'dbHost' => $row['db_host'] ?? '',
            'dbUser' => $row['db_user'] ?? '',
            'dbPass' => $row['db_pass'] ?? '',
            'dbName' => $row['db_name'] ?? '',
            'smtpHost' => $row['smtp_host'] ?? '',
            'smtpPort' => $row['smtp_port'] ?? '',
            'smtpUser' => $row['smtp_user'] ?? '',
            'smtpPass' => $row['smtp_pass'] ?? '',
            'recaptchaSiteKey' => $row['recaptcha_site_key'] ?? '',
            'recaptchaSecretKey' => $row['recaptcha_secret_key'] ?? '',
            'heroTitle' => $row['hero_title'] ?? '',
            'heroSubtitle' => $row['hero_subtitle'] ?? '',
            'heroImageUrl' => $row['hero_image_url'] ?? '',
            'aboutText' => [
                'en' => $row['about_text_en'] ?? '',
                'fi' => $row['about_text_fi'] ?? '',
                'fa' => $row['about_text_fa'] ?? ''
            ],
            'contactEmail' => $row['contact_email'] ?? '',
            'contactPhone' => $row['contact_phone'] ?? '',
            'mapEmbedUrl' => $row['map_embed_url'] ?? ''
        ];

        echo json_encode($settings);
    } catch (Exception $e) {
        echo json_encode(['error' => $e->getMessage()]);
    }
    exit();
}

// --- POST Settings ---
if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);

    $smtpHost = $input['smtpHost'] ?? '';
    $smtpPort = $input['smtpPort'] ?? '';
    $smtpUser = $input['smtpUser'] ?? '';
    $smtpPass = $input['smtpPass'] ?? '';
    $reSiteKey = $input['recaptchaSiteKey'] ?? '';
    $reSecKey = $input['recaptchaSecretKey'] ?? '';
    $heroTitle = $input['heroTitle'] ?? '';
    $heroSub = $input['heroSubtitle'] ?? '';
    
    // Handle Image Upload
    $heroImgRaw = $input['heroImageUrl'] ?? '';
    $heroImg = uploadImage($heroImgRaw, 'hero');
    
    $aboutEn = $input['aboutText']['en'] ?? '';
    $aboutFi = $input['aboutText']['fi'] ?? '';
    $aboutFa = $input['aboutText']['fa'] ?? '';
    
    $email = $input['contactEmail'] ?? '';
    $phone = $input['contactPhone'] ?? '';
    $map = $input['mapEmbedUrl'] ?? '';

    try {
        $check = $pdo->query("SELECT id FROM settings WHERE id = 1")->fetch();
        
        if ($check) {
            $sql = "UPDATE settings SET 
                smtp_host=?, smtp_port=?, smtp_user=?, smtp_pass=?,
                recaptcha_site_key=?, recaptcha_secret_key=?,
                hero_title=?, hero_subtitle=?, hero_image_url=?,
                about_text_en=?, about_text_fi=?, about_text_fa=?,
                contact_email=?, contact_phone=?, map_embed_url=?
                WHERE id = 1";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                $smtpHost, $smtpPort, $smtpUser, $smtpPass,
                $reSiteKey, $reSecKey,
                $heroTitle, $heroSub, $heroImg,
                $aboutEn, $aboutFi, $aboutFa,
                $email, $phone, $map
            ]);
        } else {
            $sql = "INSERT INTO settings (
                id, smtp_host, smtp_port, smtp_user, smtp_pass,
                recaptcha_site_key, recaptcha_secret_key,
                hero_title, hero_subtitle, hero_image_url,
                about_text_en, about_text_fi, about_text_fa,
                contact_email, contact_phone, map_embed_url
            ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                $smtpHost, $smtpPort, $smtpUser, $smtpPass,
                $reSiteKey, $reSecKey,
                $heroTitle, $heroSub, $heroImg,
                $aboutEn, $aboutFi, $aboutFa,
                $email, $phone, $map
            ]);
        }

        echo json_encode(['success' => true]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
    exit();
}
?>