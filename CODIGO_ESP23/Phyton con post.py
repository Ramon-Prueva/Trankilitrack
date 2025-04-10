import machine
import dht
import time
import math
import neopixel
import urequests as requests
import network

# Configurar conexión Wi-Fi
SSID = "DESKTOP-IJ6IQAC 3558"
PASSWORD = "Miguelchulo#123"

def conectar_wifi():
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)
    wlan.connect(SSID, PASSWORD)
    print("Conectando a Wi-Fi...")
    while not wlan.isconnected():
        time.sleep(1)
    print("Conectado a Wi-Fi:", wlan.ifconfig())

conectar_wifi()

# Configuración de los sensores
sensor_dht = dht.DHT11(machine.Pin(27))
sensor_sound = machine.ADC(machine.Pin(34))
sensor_light = machine.ADC(machine.Pin(35))
buzzer = machine.Pin(14, machine.Pin.OUT)
led_pin = machine.Pin(25, machine.Pin.OUT)
num_leds = 30
led_strip = neopixel.NeoPixel(led_pin, num_leds)
sensor_co2 = machine.ADC(machine.Pin(36))

# Ajuste de los sensores analógicos
sensor_sound.atten(machine.ADC.ATTN_11DB)
sensor_light.atten(machine.ADC.ATTN_11DB)
sensor_co2.atten(machine.ADC.ATTN_11DB)

def get_sound_level():
    muestras = 5
    total = 0
    for _ in range(muestras):
        total += sensor_sound.read()
        time.sleep(0.01)
    valor_raw = total / muestras
    return round(math.log10(max(valor_raw, 1)) * 20, 1)

def get_co2_level():
    muestras = 5
    total = 0
    for _ in range(muestras):
        total += sensor_co2.read()
        time.sleep(0.01)
    valor_co2 = total / muestras
    ppm = 400 + ((valor_co2 - 1000) / (4095 - 1000)) * (1500 - 400)
    return round(min(max(ppm, 400), 1500), 1)

def get_light_level():
    muestras = 5
    total = 0
    for _ in range(muestras):
        total += sensor_light.read()
        time.sleep(0.01)
    valor_luz = total / muestras
    lux = (valor_luz / 4095) * 1000
    return round(max(lux, 0), 1)

# URL del servidor
url = "http://192.168.137.85/Proyecto/guardar_datos.php"

while True:
    try:
        sensor_dht.measure()
        temperatura = sensor_dht.temperature()
        humedad = sensor_dht.humidity()
        co2 = get_co2_level()
        nivel_sonido = get_sound_level()
        nivel_luz = get_light_level()

        # Mostrar datos en consola
        print(f"Temperatura: {temperatura}°C | Humedad: {humedad}% | CO2: {co2} ppm")
        print(f"Nivel de sonido: {nivel_sonido} dB | Nivel de luz: {nivel_luz} Lux")

        # Preparar datos como cadenas con 1 decimal
        datos = {
            "temperatura": str(temperatura),
            "humedad": str(humedad),
            "co2": f"{co2:.1f}",
            "sonido": f"{nivel_sonido:.1f}",
            "luz": f"{nivel_luz:.1f}"
        }

        try:
            respuesta = requests.post(url, json=datos)
            print("Respuesta del servidor:", respuesta.text)
            respuesta.close()
        except Exception as e:
            print("Error al enviar datos al servidor:", e)

        # Alerta si temperatura >= 21°C
        if temperatura >= 21:
            for _ in range(3):
                buzzer.on()
                for i in range(num_leds):
                    led_strip[i] = (255, 0, 0)
                led_strip.write()
                time.sleep(0.2)
                buzzer.off()
                for i in range(num_leds):
                    led_strip[i] = (0, 0, 0)
                led_strip.write()
                time.sleep(0.2)

    except Exception as e:
        print("Error al leer sensores:", e)

    time.sleep(2)
