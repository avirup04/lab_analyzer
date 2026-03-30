<?php
// 1. Pull in the connection and CORS headers
require 'config.php';

// 2. Read the JSON from React
$json_data = file_get_contents("php://input");
$data = json_decode($json_data);

// 3. Check if both fields were sent
if (isset($data->rollNo) && isset($data->password)) {
    
    $roll = $data->rollNo;
    $plain_password = $data->password;

    // 4. Securely search the database (ADDED roll_no HERE)
    $stmt = $conn->prepare("SELECT id, full_name, roll_no, password FROM users WHERE roll_no = ?");
    $stmt->bind_param("s", $roll);
    $stmt->execute();
    
    // Grab the results
    $result = $stmt->get_result();

    // 5. Did we find a user with that roll number?
    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();
        
        // 6. THE MAGIC CHECK: Verify the typed password against the encrypted hash
        if (password_verify($plain_password, $user['password'])) {
            // Password matches! Send back name AND ROLL NUMBER.
            echo json_encode([
                "status" => "success", 
                "message" => "Welcome back, " . $user['full_name'] . "!",
                "user" => [
                    "id" => $user['id'],
                    "name" => $user['full_name'],
                    "roll_no" => $user['roll_no'] // <--- THE FIX IS HERE!
                ]
            ]);
        } else {
            // Password was wrong
            echo json_encode(["status" => "error", "message" => "Incorrect password."]);
        }
    } else {
        // Roll number wasn't found in the database
        echo json_encode(["status" => "error", "message" => "Roll number not found. Please register first."]);
    }

    $stmt->close();
} else {
    echo json_encode(["status" => "error", "message" => "Please enter both Roll Number and Password."]);
}

$conn->close();