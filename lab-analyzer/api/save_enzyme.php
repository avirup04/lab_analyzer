<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

include 'config.php'; 

$data = json_decode(file_get_contents("php://input"));

if(isset($data->userId) && isset($data->title)) {
    // We add (string) to force PHP 8 strict mode to accept the numbers
    $userId = $conn->real_escape_string((string)$data->userId);
    $title = $conn->real_escape_string((string)$data->title);
    $pathLength = $conn->real_escape_string((string)$data->pathLength);
    $epsilon = $conn->real_escape_string((string)$data->epsilon);
    $time = $conn->real_escape_string((string)$data->time);
    $km = $conn->real_escape_string((string)$data->km);
    $vmax = $conn->real_escape_string((string)$data->vmax);
    $points = $conn->real_escape_string(json_encode($data->points));

    $sql = "INSERT INTO enzyme_experiments (user_id, title, path_length, epsilon, incubation_time, km, vmax, data_points) 
            VALUES ('$userId', '$title', '$pathLength', '$epsilon', '$time', '$km', '$vmax', '$points')";

    if($conn->query($sql) === TRUE) {
        echo json_encode(["status" => "success"]);
    } else {
        echo json_encode(["status" => "error", "message" => "MySQL Error: " . $conn->error]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Missing required data."]);
}
$conn->close();
?>