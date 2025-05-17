<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

$host = "localhost";
$usuario = "root";
$contrasena = "";
$base_datos = "sensores";

$conn = new mysqli($host, $usuario, $contrasena, $base_datos);
if ($conn->connect_error) {
    die(json_encode(["status" => "ERROR", "mensaje" => "Error de conexión: " . $conn->connect_error]));
}

$fecha_inicio = isset($_GET['fecha_inicio']) ? $_GET['fecha_inicio'] : null;
$fecha_fin = isset($_GET['fecha_fin']) ? $_GET['fecha_fin'] : null;
$temp_min = isset($_GET['temp_min']) ? floatval($_GET['temp_min']) : null;
$temp_max = isset($_GET['temp_max']) ? floatval($_GET['temp_max']) : null;
$hum_min = isset($_GET['hum_min']) ? floatval($_GET['hum_min']) : null;
$hum_max = isset($_GET['hum_max']) ? floatval($_GET['hum_max']) : null;
$co2_min = isset($_GET['co2_min']) ? floatval($_GET['co2_min']) : null;
$co2_max = isset($_GET['co2_max']) ? floatval($_GET['co2_max']) : null;
$sonido_min = isset($_GET['sonido_min']) ? floatval($_GET['sonido_min']) : null;
$sonido_max = isset($_GET['sonido_max']) ? floatval($_GET['sonido_max']) : null;
$luz_min = isset($_GET['luz_min']) ? floatval($_GET['luz_min']) : null;
$luz_max = isset($_GET['luz_max']) ? floatval($_GET['luz_max']) : null;

$sql = "SELECT * FROM datos_sensores WHERE 1=1";

if ($fecha_inicio) {
    $fecha_inicio = $conn->real_escape_string($fecha_inicio);
    $sql .= " AND fecha >= '$fecha_inicio'";
}

if ($fecha_fin) {
    $fecha_fin = $conn->real_escape_string($fecha_fin);
    $sql .= " AND fecha <= '$fecha_fin'";
}

if ($temp_min !== null) $sql .= " AND temperatura >= $temp_min";
if ($temp_max !== null) $sql .= " AND temperatura <= $temp_max";
if ($hum_min !== null) $sql .= " AND humedad >= $hum_min";
if ($hum_max !== null) $sql .= " AND humedad <= $hum_max";
if ($co2_min !== null) $sql .= " AND co2 >= $co2_min";
if ($co2_max !== null) $sql .= " AND co2 <= $co2_max";
if ($sonido_min !== null) $sql .= " AND sonido >= $sonido_min";
if ($sonido_max !== null) $sql .= " AND sonido <= $sonido_max";
if ($luz_min !== null) $sql .= " AND luz >= $luz_min";
if ($luz_max !== null) $sql .= " AND luz <= $luz_max";

$sql .= " ORDER BY fecha DESC LIMIT 1000";

$result = $conn->query($sql);
$datos = [];

if ($result) {
    while ($row = $result->fetch_assoc()) {
        $datos[] = [
            'fecha' => $row['fecha'],
            'temperatura' => $row['temperatura'],
            'humedad' => $row['humedad'],
            'co2' => $row['co2'],
            'sonido' => $row['sonido'],
            'luz' => $row['luz']
        ];
    }
    echo json_encode(["status" => "OK", "datos" => $datos]);
} else {
    echo json_encode(["status" => "ERROR", "mensaje" => "Error al consultar datos: " . $conn->error]);
}

$conn->close();
?>