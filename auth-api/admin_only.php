<?php
include 'config.php';

$data = json_decode(file_get_contents('php://input'), true);
$userId = $data['userId'] ?? 0;

if ($userId <= 0) {
    echo json_encode(['success' => false, 'message' => 'Invalid request']);
    exit;
}

$stmt = $pdo->prepare("SELECT role FROM users WHERE id = ?");
$stmt->execute([$userId]);
$user = $stmt->fetch();

if (!$user || $user['role'] !== 'admin') {
    echo json_encode(['success' => false, 'message' => 'Access denied: Admin only']);
    exit;
}

// If admin → return some dummy admin data
echo json_encode([
    'success' => true,
    'message' => 'Welcome, Admin!',
    'admin_data' => ['total_users' => 42, 'secret' => 'Only admins see this']
]);
?>