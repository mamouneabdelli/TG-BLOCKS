<?php
session_start();
require 'db.php';

$error = "";
$success = "";

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $first = trim($_POST['first_name'] ?? '');
    $last  = trim($_POST['last_name']  ?? '');
    $email = trim($_POST['email']      ?? '');
    $pass  = $_POST['password']        ?? '';
    $conf  = $_POST['confirm_password']?? '';

    if (!$first || !$last || !$email || !$pass) {
        $error = "All fields are required.";
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $error = "Please enter a valid email.";
    } elseif (strlen($pass) < 8) {
        $error = "Password must be at least 8 characters.";
    } elseif ($pass !== $conf) {
        $error = "Passwords do not match.";
    } else {
        // Check if email already exists
        $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            $error = "This email is already registered.";
        } else {
            $hash = password_hash($pass, PASSWORD_BCRYPT);
            $stmt = $pdo->prepare("INSERT INTO users (first_name, last_name, email, password) VALUES (?,?,?,?)");
            $stmt->execute([$first, $last, $email, $hash]);
            $_SESSION['user_id'] = $pdo->lastInsertId();
            $_SESSION['user_name'] = $first;
            header("Location: index.html");
            exit;
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Sign Up — TG-Blocks</title>
  <link rel="stylesheet" href="index.css"/>
  <link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700&display=swap" rel="stylesheet"/>
</head>
<body class="dark-mode auth-page">
  <div class="auth-box">
    <div class="auth-logo"><a href="index.html" style="text-decoration:none"><div class="logo-text">TG<span>.</span>BLOCKS</div></a></div>
    <h1 class="auth-title">Create Account</h1>
    <p class="auth-sub">Start learning algorithms for free</p>
    <?php if ($error): ?><div class="auth-error"><?= htmlspecialchars($error) ?></div><?php endif; ?>
    <form method="POST">
      <div class="form-row">
        <div class="form-group"><label>First Name</label><input type="text" name="first_name" class="form-control" required placeholder="Ahmed"/></div>
        <div class="form-group"><label>Last Name</label><input type="text" name="last_name" class="form-control" required placeholder="Benali"/></div>
      </div>
      <div class="form-group"><label>Email</label><input type="email" name="email" class="form-control" required placeholder="ahmed@example.com"/></div>
      <div class="form-group"><label>Password</label><input type="password" name="password" class="form-control" required placeholder="Min. 8 characters"/></div>
      <div class="form-group"><label>Confirm Password</label><input type="password" name="confirm_password" class="form-control" required placeholder="Repeat password"/></div>
      <button type="submit" class="btn btn--primary btn--full">Create Account →</button>
    </form>
    <div class="auth-link">Already have an account? <a href="login.php">Log in</a></div>
  </div>
  <script src="index.js"></script>
</body>
</html>