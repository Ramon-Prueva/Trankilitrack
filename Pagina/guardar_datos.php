<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

// Ruta absoluta para asegurar que del archivio esta ahi
$archivo_datos = __DIR__ . '/datos_sensores.txt';
$archivo_json = __DIR__ . '/ultimos_datos.json';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $json = file_get_contents("php://input");
    $datos = json_decode($json, true);

    if ($datos) {
        // Datos para archivo de texto
        $registro = date("Y-m-d H:i:s") . " | " .
                    "Temperatura: " . $datos["temperatura"] . "°C | " .
                    "Humedad: " . $datos["humedad"] . "% | " .
                    "CO2: " . $datos["co2"] . " ppm | " .
                    "Sonido: " . $datos["sonido"] . " dB | " .
                    "Luz: " . $datos["luz"] . " Lux" . PHP_EOL;

        // Guardar en archivo de texto
        file_put_contents($archivo_datos, $registro, FILE_APPEND);

        // datos para el dashboard
        $datos_para_html = [
            'status' => 'OK',
            'fecha' => date("Y-m-d H:i:s"),
            'temperatura' => $datos["temperatura"],
            'humedad' => $datos["humedad"],
            'co2' => $datos["co2"],
            'sonido' => $datos["sonido"],
            'luz' => $datos["luz"]
        ];
        
        // Guardar datos en JSON
        file_put_contents($archivo_json, json_encode($datos_para_html));

        // Responder al ESP32
        echo json_encode($datos_para_html);
    } else {
        echo json_encode(["status" => "ERROR", "mensaje" => "No se recibieron datos válidos"]);
    }
} elseif ($_SERVER["REQUEST_METHOD"] == "GET") {
    if (file_exists($archivo_json)) {
        $datos = file_get_contents($archivo_json);
        echo $datos;
    } else {
        echo json_encode([
            "status" => "ERROR",
            "mensaje" => "No hay datos disponibles",
            "fecha" => date("Y-m-d H:i:s")
        ]);
    }
} else {
    echo json_encode(["status" => "ERROR", "mensaje" => "Método no permitido"]);
}
?>