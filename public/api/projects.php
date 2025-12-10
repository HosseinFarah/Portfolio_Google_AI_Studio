<?php
// public/api/projects.php

require_once 'cors.php';
require_once 'db_connect.php';

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

try {
    // --- GET: دریافت لیست پروژه‌ها ---
    if ($method === 'GET') {
        $stmt = $pdo->query("SELECT * FROM projects ORDER BY created_at DESC");
        $projects = $stmt->fetchAll();
        
        // تبدیل فرمت دیتابیس به فرمت JSON مورد نیاز فرانت‌‌اند
        foreach ($projects as &$p) {
            // تبدیل استک تکنولوژی به آرایه
            if (strpos($p['tech_stack'], '[') === 0) {
                $p['techStack'] = json_decode($p['tech_stack']);
            } else {
                $p['techStack'] = array_map('trim', explode(',', $p['tech_stack']));
            }
            
            // مپ کردن توضیحات چند زبانه
            $p['description'] = [
                'en' => $p['description_en'] ?? '',
                'fi' => $p['description_fi'] ?? '', // ستون جدید
                'fa' => $p['description_fa'] ?? ''  // ستون جدید
            ];
            
            // مپ کردن نام ستون‌های دیتابیس به نام‌های کمل‌کیس جاوااسکریپت
            $p['imageUrl'] = $p['image_url'];
            $p['githubUrl'] = $p['github_url'];
            $p['demoUrl'] = $p['demo_url'];
        }
        echo json_encode($projects);
        exit();
    }

    // --- POST: ساخت، آپدیت یا لایک کردن ---
    if ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        
        // 1. عملیات لایک کردن
        if (isset($input['action']) && $input['action'] === 'like') {
            $id = $input['id'];
            $stmt = $pdo->prepare("UPDATE projects SET likes = likes + 1 WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['success' => true]);
            exit();
        }

        // 2. عملیات ذخیره یا ویرایش پروژه
        $title = $input['title'];
        
        // دریافت توضیحات به تفکیک زبان
        $descEn = $input['description']['en'] ?? '';
        $descFi = $input['description']['fi'] ?? '';
        $descFa = $input['description']['fa'] ?? '';
        
        // تبدیل آرایه تکنولوژی‌ها به رشته برای ذخیره در دیتابیس
        $techStack = is_array($input['techStack']) ? implode(',', $input['techStack']) : $input['techStack'];
        
        $github = $input['githubUrl'] ?? '';
        $demo = $input['demoUrl'] ?? '';
        $img = $input['imageUrl'] ?? '';
        $likes = $input['likes'] ?? 0;

        if (!empty($input['id'])) {
            // UPDATE: ویرایش پروژه موجود
            $sql = "UPDATE projects SET 
                    title=?, 
                    description_en=?, 
                    description_fi=?, 
                    description_fa=?, 
                    tech_stack=?, 
                    github_url=?, 
                    demo_url=?, 
                    image_url=?, 
                    likes=? 
                    WHERE id=?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$title, $descEn, $descFi, $descFa, $techStack, $github, $demo, $img, $likes, $input['id']]);
        } else {
            // INSERT: ایجاد پروژه جدید
            $sql = "INSERT INTO projects (
                    title, description_en, description_fi, description_fa, 
                    tech_stack, github_url, demo_url, image_url, likes
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$title, $descEn, $descFi, $descFa, $techStack, $github, $demo, $img, $likes]);
        }
        
        echo json_encode(['success' => true]);
        exit();
    }

    // --- DELETE: حذف پروژه ---
    if ($method === 'DELETE') {
        $id = $_GET['id'] ?? null;
        if ($id) {
            $stmt = $pdo->prepare("DELETE FROM projects WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'message' => 'No ID provided']);
        }
        exit();
    }

} catch (PDOException $e) {
    // هندل کردن خطاهای دیتابیس
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    exit();
} catch (Exception $e) {
    // هندل کردن سایر خطاها
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    exit();
}
?>