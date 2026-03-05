<?php
include 'config.php';

$data = json_decode(file_get_contents('php://input'), true);

$email    = trim($data['email'] ?? '');
$password = $data['password'] ?? '';

if (empty($email) || empty($password)) {
    echo json_encode(['success' => false, 'message' => 'Email and password required']);
    exit;
}

$stmt = $pdo->prepare("SELECT id, name, password, role FROM users WHERE email = ?");
$stmt->execute([$email]);
$user = $stmt->fetch();

if ($user && password_verify($password, $user['password'])) {
    echo json_encode([
        'success' => true,
        'message' => 'Login successful',
        'user' => [
            'id'    => $user['id'],
            'name'  => $user['name'],
            'email' => $email,
            'role'  => $user['role'] ?? 'user'  // fallback to 'user' if somehow null
        ]
    ]);
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid email or password']);
}
?>