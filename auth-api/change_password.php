<?php
include 'config.php';

$data = json_decode(file_get_contents('php://input'), true);

$userId      = $data['userId'] ?? 0;
$currentPwd  = $data['currentPassword'] ?? '';
$newPwd      = $data['newPassword'] ?? '';
$confirmPwd  = $data['confirmPassword'] ?? '';

if ($userId <= 0 || empty($currentPwd) || empty($newPwd)) {
    echo json_encode(['success' => false, 'message' => 'All fields required']);
    exit;
}

if ($newPwd !== $confirmPwd) {
    echo json_encode(['success' => false, 'message' => 'New passwords do not match']);
    exit;
}

// Check current password
$stmt = $pdo->prepare("SELECT password FROM users WHERE id = ?");
$stmt->execute([$userId]);
$user = $stmt->fetch();

if (!$user || !password_verify($currentPwd, $user['password'])) {
    echo json_encode(['success' => false, 'message' => 'Current password incorrect']);
    exit;
}

// Hash new password
$hashed = password_hash($newPwd, PASSWORD_DEFAULT);

$stmt = $pdo->prepare("UPDATE users SET password = ? WHERE id = ?");
$stmt->execute([$hashed, $userId]);

echo json_encode(['success' => true, 'message' => 'Password changed successfully']);
?>