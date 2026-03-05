<?php
include 'config.php';

$data = json_decode(file_get_contents('php://input'), true);

$userId = $data['userId'] ?? 0;
$name   = trim($data['name'] ?? '');
$picture = $data['profilePicture'] ?? null; // base64 string or null

if ($userId <= 0 || empty($name)) {
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit;
}

$stmt = $pdo->prepare("UPDATE users SET name = ?, profile_picture = ? WHERE id = ?");
$stmt->execute([$name, $picture, $userId]);

echo json_encode(['success' => true, 'message' => 'Profile updated']);
?>