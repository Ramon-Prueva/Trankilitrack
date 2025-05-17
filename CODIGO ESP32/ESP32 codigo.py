import machine
import dht
import time
import math
import neopixel
import urequests as requests
import network

SSID = ""
PASSWORD = ""

def conectar_wifi():
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)
    wlan.connect(SSID, PASSWORD)
    while not wlan.isconnected():
        time.sleep(1)

conectar_wifi()

sensor_dht = dht.DHT11(machine.Pin(27))
sensor_sound = machine.ADC(machine.Pin(34))
sensor_light = machine.ADC(machine.Pin(35))
buzzer = machine.Pin(14, machine.Pin.OUT)
led_pin = machine.Pin(25, machine.Pin.OUT)
num_leds = 30
try:
    led_strip = neopixel.NeoPixel(led_pin, num_leds)
except Exception as e:
    led_strip = None

boton = machine.Pin(18, machine.Pin.IN, machine.Pin.PULL_UP)

def beep(duration_ms=100, freq_hz=1000):
    if duration_ms <= 0:
        return
    period_us = int(1000000 / freq_hz)
    half_period = period_us // 2
    end_time = time.ticks_add(time.ticks_ms(), duration_ms)
    while time.ticks_diff(end_time, time.ticks_ms()) > 0:
        buzzer.on()
        time.sleep_us(half_period)
        buzzer.off()
        time.sleep_us(half_period)

def animacion_encendido_inicial():
    if led_strip is None:
        return
    try:
        for freq in range(500, 1500, 100):
            beep(50, freq)
        for i in range(10):
            led_strip[i] = (0, 255, 0)
            led_strip.write()
            beep(50, 1000 + i*100)
            time.sleep(0.05)
        beep(200, 1500)
        time.sleep(0.1)
        beep(200, 1200)
        time.sleep(0.3)
        for i in range(10):
            led_strip[i] = (0, 0, 0)
            led_strip.write()
    except Exception as e:
        pass

def animacion_apagado():
    if led_strip is None:
        return
    try:
        for freq in range(1500, 400, -100):
            beep(50, freq)
        for i in range(9, -1, -1):
            led_strip[i] = (255, 0, 0)
            led_strip.write()
            beep(50, 800 + i*50)
            time.sleep(0.05)
        beep(300, 400)
        time.sleep(0.1)
        beep(100, 300)
        for i in range(10):
            led_strip[i] = (0, 0, 0)
        led_strip.write()
    except Exception as e:
        pass

sensor_co2 = machine.ADC(machine.Pin(36))

sensor_sound.atten(machine.ADC.ATTN_0DB)
sensor_light.atten(machine.ADC.ATTN_11DB)
sensor_co2.atten(machine.ADC.ATTN_11DB)

def get_sound_level():
    muestras = 1000
    max_valor = 0
    min_valor = 4095
    for _ in range(muestras):
        valor = sensor_sound.read()
        max_valor = max(max_valor, valor)
        min_valor = min(min_valor, valor)
    amplitud = max_valor - min_valor
    if amplitud < 100:
        db = 50.0
    else:
        db = 50 + 20 * math.log10(amplitud / 100.0)
    return round(min(max(db, 50), 100), 1)

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
    muestras = 100
    valores = []
    for _ in range(muestras):
        valor = sensor_light.read()
        valores.append(valor)
        time.sleep(0.001)
    valor_luz = sum(valores) / muestras
    min_valor = min(valores)
    max_valor = max(valores)
    if max_valor - min_valor < 50:
        lux = 60 + (valor_luz / 50) * (300 - 60)
    else:
        lux = 60 + (valor_luz / 4095) * (300 - 60)
    return round(max(min(lux, 300), 60), 1)

url = "http://192.168.1.143/Proyecto/guardar_datos.php"

def establecer_color_alerta_temperatura(temperatura):
    if led_strip is None:
        return
    if temperatura < 20:
        color = (0, 0, 255)
    elif 20 <= temperatura <= 25:
        color = (0, 255, 0)
    else:
        color = (255, 0, 0)
    for i in range(3):
        led_strip[i] = color
    led_strip.write()

def establecer_color_alerta_humedad(humedad):
    if led_strip is None:
        return
    if humedad < 30:
        color = (255, 0, 0)
    elif 30 <= humedad <= 60:
        color = (0, 255, 0)
    else:
        color = (255, 255, 0)
    for i in range(3, 6):
        led_strip[i] = color
    led_strip.write()

def establecer_color_alerta_co2(co2):
    if led_strip is None:
        return
    if co2 < 1100:
        color = (255, 0, 0)
    elif 1100 <= co2 <= 1200:
        color = (0, 255, 0)
    else:
        color = (255, 255, 0)
    for i in range(6, 9):
        led_strip[i] = color
    led_strip.write()

def verificar_boton():
    if boton.value() == 0:
        return True
    return False

def apagar_leds():
    if led_strip is None:
        return
    for i in range(num_leds):
        led_strip[i] = (0, 0, 0)
    led_strip.write()

sistema_encendido = False

while True:
    if verificar_boton():
        if sistema_encendido:
            animacion_apagado()
        else:
            animacion_encendido_inicial()
        sistema_encendido = not sistema_encendido
        time.sleep(0.2)

    if sistema_encendido:
        try:
            sensor_dht.measure()
            temperatura = sensor_dht.temperature()
            humedad = sensor_dht.humidity()
            co2 = get_co2_level()
            nivel_sonido = get_sound_level()
            nivel_luz = get_light_level()

            datos = {
                "temperatura": str(temperatura),
                "humedad": str(humedad),
                "co2": f"{co2:.1f}",
                "sonido": f"{nivel_sonido:.1f}",
                "luz": f"{nivel_luz:.1f}"
            }

            try:
                respuesta = requests.post(url, json=datos)
                respuesta.close()
            except Exception as e:
                pass

            establecer_color_alerta_temperatura(temperatura)
            establecer_color_alerta_humedad(humedad)
            establecer_color_alerta_co2(co2)

        except Exception as e:
            pass

        time.sleep(2)
    else:
        apagar_leds()
        time.sleep(1)
