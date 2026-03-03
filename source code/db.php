<?php
define('DB_HOST', 'localhost');
define('DB_USER', 'tg_blocks');       
define('DB_PASS', '');           
define('DB_NAME', 'tg_blocks');

$pdo = new PDO(
    "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
    DB_USER, DB_PASS,
    [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ]

);
