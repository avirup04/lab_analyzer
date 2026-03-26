<?php
require 'config.php';
$data = json_decode(file_get_contents("php://input"));

if (isset($data->id)) {
    $stmt = $conn->prepare("DELETE FROM experiments WHERE id = ?");
    $stmt->bind_param("i", $data->id);

    if ($stmt->execute()) {
        echo json_encode(["status" => "success"]);
    } else {
        echo json_encode(["status" => "error", "message" => $conn->error]);
    }
    $stmt->close();
}
$conn->close();