# 📋 Explicación Completa del Código - Proyecto Erux

## 🎯 Descripción General

El **Sistema de Control de Acceso Erux** es una aplicación híbrida que combina una interfaz web moderna (React/TypeScript) con un backend robusto en Python y hardware ESP32 para control físico. El sistema implementa reconocimiento facial, RFID, códigos QR y funcionalidades de audio para crear una solución completa de seguridad.

### 🏗️ Arquitectura del Sistema

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│   🖥️ FRONTEND   │◄──►│   🐍 BACKEND    │◄──►│   🔧 ESP32     │
│                 │    │                 │    │                 │
│ React/TypeScript│    │     Python      │    │   C++/Arduino   │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │                        │                        │
        │                        │                        │
     PyWebView              State Machine              MQTT/WiFi
   (Comunicación)           (Lógica Central)         (Hardware)
```

---

## 🎨 GRUPO 1: FRONTEND (React/TypeScript)

### 📁 Estructura del Frontend
```
frontend/
├── index.html                 # Punto de entrada
├── assets/
│   └── index-D_Sk1E9_.js     # Bundle JavaScript principal
└── components/               # Componentes React (implícitos)
```

### 🔧 Tecnologías Utilizadas
- **React 19.1.0** - Framework principal
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos y diseño
- **PyWebView** - Contenedor de aplicación desktop

### 🎯 Características Principales

#### **1. Dashboard Principal**
- **Feed de cámara en vivo** con captura de frames
- **Registro de actividad** en tiempo real (últimos 20 eventos)
- **Panel de información** con estado del sistema
- **Botones de control** para acciones rápidas

#### **2. Gestión de Usuarios**
- **Creación/edición/eliminación** de usuarios
- **Captura de rostro** desde cámara en vivo
- **Escaneo de UID** RFID asíncrono
- **Horarios flexibles**: fijos, temporales, acceso total

#### **3. Sistema de Reportes**
- **Generación de reportes** JSON, PDF, CSV
- **Programación automática** de reportes
- **Visualización de datos** con gráficos
- **Reproducción de videos** de emergencia

#### **4. Asistente de IA (Erux)**
- **Chat conversacional** para consultas
- **Procesamiento en backend** por seguridad
- **Ejecución de comandos** del sistema
- **Respuestas contextuales** con datos del sistema

#### **5. Configuración Dinámica**
- **Detección automática** de cámaras disponibles
- **Configuración de puertos** COM
- **Búsqueda de dispositivos** inalámbricos
- **Estado del hardware** en tiempo real

### 🔄 Protocolo de Comunicación

#### **Frontend → Backend (JavaScript → Python)**
```javascript
// Llamadas síncronas
window.pywebview.api.addUser(userData)
window.pywebview.api.verifyMasterPassword(password)

// Llamadas asíncronas (con requestId)
window.pywebview.api.scanUID({ requestId: "scan-123" })
window.pywebview.api.searchForWirelessDevices({ requestId: "search-456" })
```

#### **Backend → Frontend (Python → JavaScript)**
```javascript
// Eventos en tiempo real
window.handleBackendEvent({
  type: "ACCESS_EVENT",
  payload: { user: "Juan", result: "granted", timestamp: "..." }
})

// Respuestas asíncronas
window.handleBackendEvent({
  type: "API_RESPONSE", 
  payload: { requestId: "scan-123", data: { uid: "UID-789" } }
})
```

### 📊 Tipos de Datos Principales

```typescript
interface RegisteredUser {
  id: string;
  name: string;
  dni: string;
  userLevel: 'Administrador' | 'Usuario' | 'Visitante';
  uid: string;
  schedule: Schedule;
  avatar: string; // Base64 o URL
}

type Schedule = 
  | { type: 'full_access' }
  | { type: 'fixed'; startTime: string; endTime: string }
  | { type: 'temporary_hours'; date: string, startTime: string, endTime: string }
  | { type: 'temporary_days'; startDate: string, endDate: string, startTime: string, endTime: string };
```

---

## 🐍 GRUPO 2: BACKEND (Python)

### 📁 Estructura del Backend
```
backend/
├── __init__.py              # Paquete principal
├── api.py                   # API principal para PyWebView
├── constants.py             # Constantes del sistema
├── db_manager.py            # Gestión de base de datos
├── validation.py            # Validaciones de datos
├── reporting.py             # Reportes y logging
├── facial_recognition.py    # Reconocimiento facial
├── state_machine.py         # Máquina de estados
├── global_state.py          # Estado global compartido
└── esp32_integration.py     # Integración con ESP32
```

### 🔧 Tecnologías Utilizadas
- **Python 3.x** - Lenguaje principal
- **PyWebView** - Interfaz con frontend
- **SQLite** - Base de datos
- **OpenCV** - Procesamiento de imágenes
- **face_recognition** - Reconocimiento facial
- **paho-mqtt** - Comunicación con ESP32
- **pyttsx3** - Síntesis de voz
- **pygame** - Efectos de audio

### 🎯 Módulos Principales

#### **1. `api.py` - API Principal**
```python
class Api:
    def addUser(self, user_data):
        """Agregar usuario con validaciones"""
        
    def scanUID(self, payload):
        """Escaneo asíncrono de UID RFID"""
        
    def chatWithErux(self, user_prompt):
        """Procesamiento de IA con Gemini"""
```

**Características:**
- **Patrón asíncrono** para operaciones lentas
- **Validación de datos** antes de procesamiento
- **Manejo de errores** robusto
- **Comunicación bidireccional** con frontend

#### **2. `state_machine.py` - Máquina de Estados**
```python
class EstadoSistema(Enum):
    REPOSO = "REPOSO"
    ESPERANDO_VALIDACION_RFID = "ESPERANDO_VALIDACION_RFID"
    ESPERANDO_VALIDACION_FACIAL = "ESPERANDO_VALIDACION_FACIAL"
    ABRIENDO_PUERTA = "ABRIENDO_PUERTA"
    EMERGENCIA_ACTIVA = "EMERGENCIA_ACTIVA"
    # ... más estados
```

**Funcionalidades:**
- **Control de flujo** del sistema
- **Validación multi-modal** (RFID + Facial + QR)
- **Timeouts y transiciones** automáticas
- **Integración con hardware** ESP32

#### **3. `facial_recognition.py` - Reconocimiento Facial**
```python
def reconocer_rostro_en_frame(frame: np.ndarray) -> Tuple[bool, Optional[Dict]]:
    """Reconocimiento facial en tiempo real"""
    
def generar_encodings_desde_imagen(imagen_path: str) -> np.ndarray:
    """Generar encodings faciales para registro"""
```

**Características:**
- **Detección en tiempo real** con OpenCV
- **Encodings faciales** con face_recognition
- **Tolerancia configurable** para precisión
- **Optimización de rendimiento**

#### **4. `db_manager.py` - Gestión de Base de Datos**
```python
def obtener_usuario_por_rfid_bd(uid_rfid: str) -> Optional[Dict]:
    """Buscar usuario por UID RFID"""
    
def agregar_usuario_bd(usuario_data: Dict) -> bool:
    """Agregar nuevo usuario"""
```

**Funcionalidades:**
- **CRUD completo** de usuarios
- **Esquema relacional** optimizado
- **Transacciones seguras**
- **Backup automático**

#### **5. `esp32_integration.py` - Integración ESP32**
```python
class ESP32Manager:
    def request_rfid_scan(self) -> bool:
        """Solicitar escaneo RFID al ESP32"""
        
    def open_door(self) -> bool:
        """Abrir puerta via ESP32"""
```

**Características:**
- **Comunicación MQTT** bidireccional
- **Callbacks configurables** para eventos
- **Fallback a simulación** si no hay hardware
- **Monitoreo de estado** en tiempo real

#### **6. `audio_manager.py` - Sistema de Audio**
```python
class AudioManager:
    def announce_access_result(self, user_name: str, result: str, reason: str = ""):
        """Anunciar resultado de acceso por voz"""
        
    def play_sound(self, event: AudioEvent):
        """Reproducir efecto de sonido"""
```

**Funcionalidades:**
- **Síntesis de voz** (TTS) en español
- **Efectos de sonido** personalizables
- **Cola no bloqueante** para audio
- **Configuración dinámica** de volumen/velocidad

### 🔄 Flujo de Datos Backend

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Frontend  │───►│     API     │───►│ Validation  │
└─────────────┘    └─────────────┘    └─────────────┘
                           │                   │
                           ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   ESP32     │◄──►│State Machine│───►│ DB Manager  │
└─────────────┘    └─────────────┘    └─────────────┘
                           │                   │
                           ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│Audio Manager│◄───│  Reporting  │───►│Facial Recog.│
└─────────────┘    └─────────────┘    └─────────────┘
```

---

## 🔧 GRUPO 3: ESP32 (C++/Arduino)

### 📁 Estructura del ESP32
```
esp32/
├── main.cpp                 # Código principal
├── esp32_config.json        # Configuración MQTT
└── libraries/               # Librerías adicionales
```

### 🔧 Tecnologías Utilizadas
- **ESP32** - Microcontrolador principal
- **Arduino Framework** - Entorno de desarrollo
- **WiFi** - Conectividad inalámbrica
- **MQTT** - Protocolo de comunicación
- **JSON** - Formato de datos
- **DAC** - Para audio con PAM8403

### 🎯 Componentes de Hardware

#### **1. Sensores**
```cpp
// Sensores ultrasónicos HC-SR04
const int PIN_SP1_TRIG = 18;
const int PIN_SP1_ECHO = 19;
const int PIN_SP2_TRIG = 21;
const int PIN_SP2_ECHO = 22;

// Botones y DIP switches
const int PIN_S1_BUTTON = 32;
const int PIN_S2_BUTTON = 35;
const int PIN_EMERGENCY_BUTTON = 34;
```

#### **2. Actuadores**
```cpp
// Control de puerta
const int PIN_MOTOR_OPEN = 12;
const int PIN_MOTOR_CLOSE = 14;

// LEDs de estado
const int PIN_LED_STATUS = 2;
const int PIN_LED_RFID = 4;
const int PIN_LED_ERROR = 5;

// Audio
const int PIN_BUZZER = 13;           // Buzzer simple
const int PIN_AUDIO_LEFT = 25;      // PAM8403 canal izquierdo
const int PIN_AUDIO_RIGHT = 26;     // PAM8403 canal derecho
```

### 🔄 Protocolo MQTT

#### **Tópicos de Comunicación**
```cpp
// Datos del ESP32 al sistema
const char* TOPIC_DATA_OUT = "acceso/puerta1/data";
const char* TOPIC_STATUS_OUT = "acceso/puerta1/status";

// Comandos del sistema al ESP32
const char* TOPIC_COMMAND_IN = "acceso/puerta1/command";
```

#### **Formato de Mensajes**

**Datos de Sensores:**
```json
{
  "type": "sensor_data",
  "sp1_distance": 15.2,
  "sp2_distance": 999.0,
  "button_s1": 1,
  "button_s2": 1,
  "emergency": 0,
  "timestamp": 1234567890
}
```

**Comandos de Control:**
```json
{
  "command": "OPEN_DOOR",
  "parameters": {
    "duration": 5000
  }
}
```

### 🎯 Funcionalidades Principales

#### **1. Configuración Dinámica DIP (Hardware + Software)**
```cpp
// Sistema híbrido: Software override + Hardware fallback
String readDipSwitchConfig() {
    StaticJsonDocument<200> doc;
    
    // Prioridad: Software override, luego hardware físico
    if (softwareConfigEnabled) {
        doc["rfid"] = softwareConfig.rfid;
        doc["qr"] = softwareConfig.qr;
        doc["facial"] = softwareConfig.facial;
        doc["logic"] = softwareConfig.logic;
        doc["source"] = "software";
    } else {
        // Leer DIP switches físicos como fallback
        bool rfid_enabled = !digitalRead(PIN_DIP_RFID);
        bool qr_enabled = !digitalRead(PIN_DIP_QR);
        bool facial_enabled = !digitalRead(PIN_DIP_FACIAL);
        bool logic_and = !digitalRead(PIN_DIP_LOGIC_AND);
        
        doc["rfid"] = rfid_enabled;
        doc["qr"] = qr_enabled;
        doc["facial"] = facial_enabled;
        doc["logic"] = logic_and ? "AND" : "OR";
        doc["source"] = "hardware";
    }
    
    // Generar representación binaria
    int binary = (doc["logic"] == "AND" ? 8 : 0) |
                 (doc["facial"] ? 4 : 0) |
                 (doc["qr"] ? 2 : 0) |
                 (doc["rfid"] ? 1 : 0);
    
    char binaryStr[5];
    sprintf(binaryStr, "%04d", binary);
    doc["binary"] = binaryStr;
    
    String result;
    serializeJson(doc, result);
    return result;
}

// Comando para actualizar configuración via MQTT
void handleDipConfigCommand(String payload) {
    StaticJsonDocument<200> doc;
    deserializeJson(doc, payload);
    
    softwareConfig.rfid = doc["rfid"];
    softwareConfig.qr = doc["qr"];
    softwareConfig.facial = doc["facial"];
    softwareConfig.logic = doc["logic"];
    softwareConfigEnabled = true;
    
    // Feedback visual/auditivo
    provideDipConfigFeedback();
    
    // Notificar cambio exitoso
    publishDipConfigUpdate();
}
```

#### **2. Lectura de Sensores**
```cpp
float readUltrasonicSensor(int trigPin, int echoPin) {
    digitalWrite(trigPin, LOW);
    delayMicroseconds(2);
    digitalWrite(trigPin, HIGH);
    delayMicroseconds(10);
    digitalWrite(trigPin, LOW);
    
    long duration = pulseIn(echoPin, HIGH);
    float distance = duration * 0.034 / 2;
    return distance;
}
```

#### **3. Control de Audio**
```cpp
void playBuzzer(int duration, int frequency) {
    if (USE_PAM8403) {
        playAudioPAM8403(duration, frequency);
    } else {
        tone(PIN_BUZZER, frequency, duration);
    }
}

void playAudioPAM8403(int duration, int frequency) {
    // Generar onda senoidal para PAM8403
    unsigned long startTime = millis();
    while (millis() - startTime < duration) {
        float sample = sin(2 * PI * frequency * (millis() - startTime) / 1000.0);
        int audioValue = (int)((sample * AUDIO_VOLUME) + 128);
        dacWrite(PIN_AUDIO_LEFT, audioValue);
        dacWrite(PIN_AUDIO_RIGHT, audioValue);
        delayMicroseconds(1000000 / AUDIO_SAMPLE_RATE);
    }
}
```

#### **4. Watchdog y Heartbeat**
```cpp
void setup() {
    // Configurar watchdog
    esp_task_wdt_init(WDT_TIMEOUT, true);
    esp_task_wdt_add(NULL);
    
    // Configurar heartbeat
    xTaskCreate(heartbeatTask, "Heartbeat", 2048, NULL, 1, NULL);
}

void heartbeatTask(void* parameter) {
    while (true) {
        publishHeartbeat();
        vTaskDelay(HEARTBEAT_INTERVAL * 1000 / portTICK_PERIOD_MS);
    }
}
```

### 🔧 Opciones de Hardware

#### **Audio Básico vs Avanzado**
```cpp
// Configuración simple con buzzer
const bool USE_PAM8403 = false;
const int PIN_BUZZER = 13;

// Configuración avanzada con PAM8403
const bool USE_PAM8403 = true;
const int PIN_AUDIO_LEFT = 25;   // DAC1
const int PIN_AUDIO_RIGHT = 26;  // DAC2
```

**Ventajas PAM8403:**
- ✅ Audio de alta calidad para anuncios de voz
- ✅ Mayor volumen (3W + 3W)
- ✅ Salida estéreo
- ✅ Tonos complejos y melodías

---

## 🧪 VALIDACIÓN DE CÓDIGOS - Analogía con Testbenches de Verilog

### 🎯 Concepto de Testbenches

Los **testbenches** son módulos de prueba que verifican el correcto funcionamiento de un sistema, ya sea hardware (Verilog/SystemVerilog) o software (Python/JavaScript). En el proyecto Erux, he implementado una suite completa de testbenches siguiendo las mejores prácticas de verificación y validación.

### 🔍 Comparación: Hardware vs Software

#### **Testbenches de Verilog/SystemVerilog:**
```verilog
module testbench_cpu;
  // Señales de prueba
  reg clk, reset;
  wire [31:0] data_out;
  
  // Device Under Test (DUT)
  cpu_module dut (.clk(clk), .reset(reset), .data_out(data_out));
  
  // Generación de estímulos
  initial begin
    reset = 1; #10 reset = 0;
    clk = 0;
    
    // Casos de prueba
    #100 assert(data_out == 32'h12345678) else $error("Test failed");
    
    $display("All tests passed!");
    $finish;
  end
  
  // Clock generation
  always #5 clk = ~clk;
endmodule
```

#### **Testbenches de Python (Proyecto Erux):**
```python
def test_state_machine():
    """Test básico de máquina de estados"""
    try:
        # Device Under Test (DUT)
        from backend.state_machine import MaquinaEstados, EstadoSistema
        fsm = MaquinaEstados()
        
        # Generación de estímulos
        fsm.cambiar_estado(EstadoSistema.ESPERANDO_VALIDACION_RFID)
        estado = fsm.get_estado_actual()
        
        # Verificación (assertion)
        assert estado == EstadoSistema.ESPERANDO_VALIDACION_RFID
        
        print("✅ Test passed!")
        return True
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False
```

### 📊 Jerarquía de Testbenches Implementados

#### **1. Unit Tests - Módulos Individuales**
```
test_state_machine.py     ←→  testbench_alu.v
test_audio_manager.py     ←→  testbench_memory.v
test_db_manager.py        ←→  testbench_register_file.v
```

**Propósito:** Verificar funcionalidad de módulos aislados

#### **2. Integration Tests - Interconexión**
```
test_main_imports.py      ←→  testbench_cpu_core.v
test_backend_api.py       ←→  testbench_bus_interface.v
```

**Propósito:** Verificar comunicación entre módulos

#### **3. System Tests - Sistema Completo**
```
test_system_integration.py ←→  testbench_soc.v
test_end_to_end.py         ←→  testbench_full_system.v
```

**Propósito:** Verificar funcionalidad completa del sistema

### 🔧 Metodología de Verificación

#### **1. Cobertura de Casos**
```python
# Casos normales
test_valid_rfid_access()
test_facial_recognition_success()

# Casos límite (corner cases)
test_expired_user_access()
test_invalid_rfid_format()

# Casos de error
test_camera_disconnected()
test_database_corruption()
```

#### **2. Verificación Temporal**
```python
def test_timeout_behavior():
    """Verificar timeouts como en testbenches de hardware"""
    fsm = MaquinaEstados()
    fsm.cambiar_estado(EstadoSistema.ESPERANDO_VALIDACION_RFID)
    
    # Simular timeout
    time.sleep(TIMEOUT_PRESENTACION_RFID_S + 1)
    
    # Verificar transición automática
    assert fsm.get_estado_actual() == EstadoSistema.ACCESO_DENEGADO_TEMPORAL
```

#### **3. Verificación de Protocolos**
```python
def test_mqtt_communication():
    """Verificar protocolo MQTT como testbench de bus"""
    esp32_manager = ESP32Manager()
    
    # Enviar comando
    esp32_manager.open_door()
    
    # Verificar respuesta
    response = wait_for_mqtt_response(timeout=5)
    assert response['status'] == 'door_opened'
```

### 📈 Beneficios de esta Metodología

#### **1. Detección Temprana de Errores**
- **Hardware:** Bugs antes de síntesis/fabricación
- **Software:** Bugs antes de despliegue/producción

#### **2. Verificación Automatizada**
```python
def run_all_tests():
    """Suite completa de pruebas automatizadas"""
    test_suite = [
        ("Unit Tests", run_unit_tests),
        ("Integration Tests", run_integration_tests),
        ("System Tests", run_system_tests)
    ]
    
    for test_name, test_func in test_suite:
        result = test_func()
        print(f"{test_name}: {'PASS' if result else 'FAIL'}")
```

#### **3. Regresión Testing**
- Verificar que nuevos cambios no rompan funcionalidad existente
- Mantener calidad durante desarrollo iterativo

#### **4. Documentación Ejecutable**
- Los tests sirven como especificación del comportamiento esperado
- Ejemplos de uso para otros desarrolladores

### 🎯 Testbenches Específicos del Proyecto

#### **`test_state_machine.py`**
```python
# Equivalente a testbench de FSM en Verilog
def test_state_transitions():
    """Verificar transiciones de estado válidas"""
    
def test_invalid_transitions():
    """Verificar que transiciones inválidas sean rechazadas"""
    
def test_timeout_handling():
    """Verificar manejo de timeouts"""
```

#### **`test_main_imports.py`**
```python
# Equivalente a testbench de top-level
def test_all_modules_load():
    """Verificar que todos los módulos se cargan correctamente"""
    
def test_api_functions_exist():
    """Verificar que la API está completa"""
```

#### **`test_system_integration.py`**
```python
# Equivalente a testbench de sistema completo
def test_complete_access_flow():
    """Verificar flujo completo de acceso"""
    
def test_emergency_mode():
    """Verificar modo de emergencia"""
```

### 🚀 Ejecución de Testbenches

```bash
# Ejecutar testbench individual
python test_state_machine.py

# Ejecutar suite completa
python -m pytest tests/

# Ejecutar con cobertura
python -m pytest --cov=backend tests/
```

### 📊 Métricas de Calidad

Al igual que en verificación de hardware, se miden métricas como:

- **Cobertura de código** (equivalente a cobertura de señales)
- **Cobertura funcional** (equivalente a cobertura de casos)
- **Tiempo de ejecución** (equivalente a timing analysis)
- **Tasa de fallos** (equivalente a error rate)

---

## 🎉 Conclusión

El proyecto Erux implementa una arquitectura robusta de tres capas (Frontend, Backend, ESP32) con una metodología de verificación inspirada en las mejores prácticas de la industria de semiconductores. Los testbenches aseguran la calidad y confiabilidad del sistema, permitiendo desarrollo iterativo seguro y mantenimiento a largo plazo.

La analogía con testbenches de Verilog no es solo conceptual, sino que refleja un enfoque profesional hacia la verificación de sistemas complejos, garantizando que cada componente funcione correctamente tanto de forma individual como integrada en el sistema completo. 
