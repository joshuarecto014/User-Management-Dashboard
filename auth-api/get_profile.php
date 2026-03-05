<?php
include 'config.php';

$data = json_decode(file_get_contents('php://input'), true);
$userId = $data['userId'] ?? 0;

if ($userId <= 0) {
    echo json_encode(['success' => false, 'message' => 'Invalid user']);
    exit;
}

$stmt = $pdo->prepare("SELECT id, name, email, profile_picture FROM users WHERE id = ?");
$stmt->execute([$userId]);
$user = $stmt->fetch();

if ($user) {
    echo json_encode([
        'success' => true,
        'user' => $user
    ]);
} else {
    echo json_encode(['success' => false, 'message' => 'User not found']);
}
?>