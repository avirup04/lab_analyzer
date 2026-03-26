<?php
require 'config.php';

$json_data = file_get_contents("php://input");
$data = json_decode($json_data);

// We need the logged-in user's ID to save it to their profile
if (isset($data->userId) && isset($data->title)) {
    
    $userId = $data->userId;
    $title = $data->title;
    $path = $data->pathLength;
    $slope = $data->slope;
    $intercept = $data->intercept;
    $epsilon = $data->epsilon;
    
    // We convert the array of points back into a string for MySQL
    $points = json_encode($data->points);

    $stmt = $conn->prepare("INSERT INTO experiments (user_id, title, path_length, data_points, slope, intercept, epsilon) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("isdsddd", $userId, $title, $path, $points, $slope, $intercept, $epsilon);

    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Experiment saved to archives!"]);
    } else {
        echo json_encode(["status" => "error", "message" => $conn->error]);
    }
    
    $stmt->close();
} else {
    echo json_encode(["status" => "error", "message" => "Missing experimental data."]);
}

$conn->close();