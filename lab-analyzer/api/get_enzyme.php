<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Adjust this path if needed, based on your image it might be 'db/config.php' 
// but I am using exactly what you had in your working file.
require 'config.php'; 

if (isset($_GET['userId'])) {
    $userId = $_GET['userId'];

    // Pointing to the new enzyme table
    $stmt = $conn->prepare("SELECT * FROM enzyme_experiments WHERE user_id = ? ORDER BY created_at DESC");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    
    $result = $stmt->get_result();
    $experiments = [];

    while ($row = $result->fetch_assoc()) {
        // Convert the JSON string back into a readable JavaScript array just like App 1
        $row['data_points'] = json_decode($row['data_points']);
        $experiments[] = $row;
    }

    echo json_encode(["status" => "success", "data" => $experiments]);
    $stmt->close();
} else {
    echo json_encode(["status" => "error", "message" => "User ID missing"]);
}
$conn->close();
?>