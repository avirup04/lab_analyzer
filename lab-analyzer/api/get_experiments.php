<?php
require 'config.php';

if (isset($_GET['userId'])) {
    $userId = $_GET['userId'];

    $stmt = $conn->prepare("SELECT * FROM experiments WHERE user_id = ? ORDER BY created_at DESC");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    
    $result = $stmt->get_result();
    $experiments = [];

    while ($row = $result->fetch_assoc()) {
        // Convert the JSON string back into a readable JavaScript array
        $row['data_points'] = json_decode($row['data_points']);
        $experiments[] = $row;
    }

    echo json_encode(["status" => "success", "data" => $experiments]);
    $stmt->close();
}
$conn->close();