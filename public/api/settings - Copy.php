<?php
require_once 'cors.php';
require_once 'db_connect.php';

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

// --- GET: دریافت تنظیمات ---
if ($method === 'GET') {
    // فرض بر این است که تنظیمات همیشه در ردیف با ID=1 ذخیره می‌شوند
    try {
        $stmt = $pdo->query("SELECT * FROM settings WHERE id = 1");
        $row = $stmt->fetch();
        
        if (!$row) {
            // اگر ردیفی نبود، یک آبجکت خالی برگردان
            echo json_encode([]); 
            exit();
        }

        // نگاشت ستون‌های دیتابیس به ساختار JSON مورد نیاز فرانت‌‌اند
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

// --- POST: ذخیره تنظیمات ---
if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);

    // دریافت مقادیر با بررسی وجود آن‌ها
    $smtpHost = $input['smtpHost'] ?? '';
    $smtpPort = $input['smtpPort'] ?? '';
    $smtpUser = $input['smtpUser'] ?? '';
    $smtpPass = $input['smtpPass'] ?? '';
    $reSiteKey = $input['recaptchaSiteKey'] ?? '';
    $reSecKey = $input['recaptchaSecretKey'] ?? '';
    $heroTitle = $input['heroTitle'] ?? '';
    $heroSub = $input['heroSubtitle'] ?? '';
    
    // متن‌های درباره ما به سه زبان
    $aboutEn = $input['aboutText']['en'] ?? '';
    $aboutFi = $input['aboutText']['fi'] ?? '';
    $aboutFa = $input['aboutText']['fa'] ?? '';
    
    $email = $input['contactEmail'] ?? '';
    $phone = $input['contactPhone'] ?? '';
    $map = $input['mapEmbedUrl'] ?? '';

    try {
        // بررسی اینکه آیا تنظیمات قبلا وجود دارد یا خیر
        $check = $pdo->query("SELECT id FROM settings WHERE id = 1")->fetch();
        
        if ($check) {
            // آپدیت کردن
            $sql = "UPDATE settings SET 
                smtp_host=?, smtp_port=?, smtp_user=?, smtp_pass=?,
                recaptcha_site_key=?, recaptcha_secret_key=?,
                hero_title=?, hero_subtitle=?, 
                about_text_en=?, about_text_fi=?, about_text_fa=?,
                contact_email=?, contact_phone=?, map_embed_url=?
                WHERE id = 1";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                $smtpHost, $smtpPort, $smtpUser, $smtpPass,
                $reSiteKey, $reSecKey,
                $heroTitle, $heroSub,
                $aboutEn, $aboutFi, $aboutFa,
                $email, $phone, $map
            ]);
        } else {
            // ساختن ردیف جدید برای اولین بار
            $sql = "INSERT INTO settings (
                id, smtp_host, smtp_port, smtp_user, smtp_pass,
                recaptcha_site_key, recaptcha_secret_key,
                hero_title, hero_subtitle, 
                about_text_en, about_text_fi, about_text_fa,
                contact_email, contact_phone, map_embed_url
            ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                $smtpHost, $smtpPort, $smtpUser, $smtpPass,
                $reSiteKey, $reSecKey,
                $heroTitle, $heroSub,
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