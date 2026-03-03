<?php
session_start();
require 'db.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request.']);
    exit;
}

$first   = trim($_POST['first_name'] ?? '');
$last    = trim($_POST['last_name']  ?? '');
$email   = trim($_POST['email']      ?? '');
$message = trim($_POST['message']    ?? '');
$rating  = $_POST['rating']          ?? '';

$allowed_ratings = ['happy', 'neutral', 'sad'];

if (!$first || !$last || !$email || !$message || !$rating) {
    echo json_encode(['success' => false, 'message' => 'All fields are required.']);
    exit;
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Invalid email address.']);
    exit;
}
if (!in_array($rating, $allowed_ratings)) {
    echo json_encode(['success' => false, 'message' => 'Invalid rating.']);
    exit;
}

try {
    $stmt = $pdo->prepare("INSERT INTO feedback (first_name, last_name, email, message, rating) VALUES (?,?,?,?,?)");
    $stmt->execute([$first, $last, $email, $message, $rating]);
    echo json_encode(['success' => true, 'message' => '✅ Thank you for your feedback!']);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Database error. Please try again.']);
}