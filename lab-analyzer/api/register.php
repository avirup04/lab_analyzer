<?php
require 'config.php';

$json_data = file_get_contents("php://input");
$data = json_decode($json_data);

if (isset($data->fullName) && isset($data->rollNo) && isset($data->email) && isset($data->password)) {
    
    $name = $data->fullName;
    $roll = $data->rollNo;
    $email = $data->email;
    $hashed_password = password_hash($data->password, PASSWORD_DEFAULT);

    $stmt = $conn->prepare("INSERT INTO users (full_name, roll_no, email, password) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("ssss", $name, $roll, $email, $hashed_password);

    // Modern PHP 8 Error Handling
    try {
        $stmt->execute();
        echo json_encode(["status" => "success", "message" => "Account created successfully!"]);
    } catch (mysqli_sql_exception $e) {
        // 1062 is the MySQL error code for a Duplicate Unique Entry
        if ($e->getCode() == 1062) {
            echo json_encode(["status" => "error", "message" => "Roll Number or Email already exists."]);
        } else {
            echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
        }
    }
    
    $stmt->close();
} else {
    echo json_encode(["status" => "error", "message" => "Please fill in all fields."]);
}

$conn->close();