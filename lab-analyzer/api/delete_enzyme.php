<?php
// Bulletproof CORS headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Content-Type: application/json");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

include 'config.php';

$data = json_decode(file_get_contents("php://input"));

if(isset($data->id)) {
    $id = $conn->real_escape_string((string)$data->id);
    $sql = "DELETE FROM enzyme_experiments WHERE id = '$id'";
    
    if($conn->query($sql) === TRUE) {
        echo json_encode(["status" => "success"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Delete failed: " . $conn->error]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "No ID provided"]);
}
$conn->close();
?>