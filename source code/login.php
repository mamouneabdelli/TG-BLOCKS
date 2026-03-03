<?php
session_start();
require 'db.php';

if (isset($_SESSION['user_id'])) {
    header("Location: index.html");
    exit;
}

$error = "";

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = trim($_POST['email'] ?? '');
    $pass  = $_POST['password'] ?? '';

    if (!$email || !$pass) {
        $error = "Both fields are required.";
    } else {
        $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if ($user && password_verify($pass, $user['password'])) {
            $_SESSION['user_id']   = $user['id'];
            $_SESSION['user_name'] = $user['first_name'];
            header("Location: index.html");
            exit;
        } else {
            $error = "Invalid email or password.";
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Log In — TG-Blocks</title>
  <link rel="stylesheet" href="index.css"/>
  <link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:opsz,wght@9..40,400;9..40,700&display=swap" rel="stylesheet"/>
</head>
<body class="dark-mode auth-page">
  <div class="auth-box">
    <div class="auth-logo"><a href="index.html" style="text-decoration:none"><div class="logo-text">TG<span>.</span>BLOCKS</div></a></div>
    <h1 class="auth-title">Welcome Back</h1>
    <p class="auth-sub">Log in to access your saved projects</p>
    <?php if ($error): ?><div class="auth-error"><?= htmlspecialchars($error) ?></div><?php endif; ?>
    <form method="POST">
      <div class="form-group"><label>Email</label><input type="email" name="email" class="form-control" required placeholder="ahmed@example.com"/></div>
      <div class="form-group"><label>Password</label><input type="password" name="password" class="form-control" required placeholder="Your password"/></div>
      <button type="submit" class="btn btn--primary btn--full">Log In →</button>
    </form>
    <div class="auth-link">No account yet? <a href="signup.php">Sign up free</a></div>
  </div>
</body>
</html>