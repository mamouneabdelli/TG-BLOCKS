<?php
// Database connection configuration
$servername = "localhost";
$username = "your_username";
$password = "your_password";
$dbname = "tgblocks_db";

// Create database connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Process form data when form is submitted
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Collect form data and sanitize inputs
    $firstName = htmlspecialchars($_POST['firstName']);
    $lastName = htmlspecialchars($_POST['lastName']);
    $email = filter_var($_POST['email'], FILTER_SANITIZE_EMAIL);
    $feedbackText = htmlspecialchars($_POST['feedbackText']);
    $rating = isset($_POST['rating']) ? htmlspecialchars($_POST['rating']) : 'not provided';
    
    // Validate email
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(["status" => "error", "message" => "Invalid email format"]);
        exit;
    }
    
    // Prepare and execute SQL statement to insert data
    $stmt = $conn->prepare("INSERT INTO feedback (first_name, last_name, email, feedback_text, rating, submission_date) VALUES (?, ?, ?, ?, ?, NOW())");
    $stmt->bind_param("sssss", $firstName, $lastName, $email, $feedbackText, $rating);
    
    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Feedback submitted successfully"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Error: " . $stmt->error]);
    }
    
    // Close statement
    $stmt->close();
    
    // Close connection
    $conn->close();
    exit;
}
?>