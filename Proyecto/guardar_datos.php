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

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $json = file_get_contents("php://input");
    $datos = json_decode($json, true);

    if ($datos) {
        $fecha = date("Y-m-d H:i:s");
        $temperatura = $conn->real_escape_string($datos["temperatura"]);
        $humedad = $conn->real_escape_string($datos["humedad"]);
        $co2 = $conn->real_escape_string($datos["co2"]);
        $sonido = $conn->real_escape_string($datos["sonido"]);
        $luz = $conn->real_escape_string($datos["luz"]);

        $sql = "INSERT INTO datos_sensores (fecha, temperatura, humedad, co2, sonido, luz)
                VALUES ('$fecha', '$temperatura', '$humedad', '$co2', '$sonido', '$luz')";

        if ($conn->query($sql) === TRUE) {
            echo json_encode([
                "status" => "OK",
                "fecha" => $fecha,
                "temperatura" => $temperatura,
                "humedad" => $humedad,
                "co2" => $co2,
                "sonido" => $sonido,
                "luz" => $luz
            ]);
        } else {
            echo json_encode(["status" => "ERROR", "mensaje" => "Error al guardar en BD"]);
        }
    } else {
        echo json_encode(["status" => "ERROR", "mensaje" => "Datos inválidos"]);
    }
} elseif ($_SERVER["REQUEST_METHOD"] == "GET") {
    $sql = "SELECT * FROM datos_sensores ORDER BY fecha DESC LIMIT 1";
    $result = $conn->query($sql);
    if ($result && $row = $result->fetch_assoc()) {
        echo json_encode([
            "status" => "OK",
            "fecha" => $row["fecha"],
            "temperatura" => $row["temperatura"],
            "humedad" => $row["humedad"],
            "co2" => $row["co2"],
            "sonido" => $row["sonido"],
            "luz" => $row["luz"]
        ]);
    } else {
        echo json_encode(["status" => "ERROR", "mensaje" => "Sin datos"]);
    }
} else {
    echo json_encode(["status" => "ERROR", "mensaje" => "Método no permitido"]);
}

$conn->close();
?>
