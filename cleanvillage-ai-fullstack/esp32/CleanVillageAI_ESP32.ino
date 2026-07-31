/*******************************************************
 * CleanVillage AI
 * Smart Waste Management System
 * ESP32 + HC-SR04
 *
 * Ultrasonic measurement logic is UNCHANGED from the
 * original sketch. Added on top of it:
 *   - WiFi connection
 *   - HTTPClient POST to the backend
 *   - JSON payload creation (ArduinoJson)
 *   - Automatic retry with backoff
 *   - Error handling / serial diagnostics
 *
 * Library required (install via Library Manager):
 *   "ArduinoJson" by Benoit Blanchon (v6.x or v7.x)
 *******************************************************/

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

#define TRIG_PIN 5
#define ECHO_PIN 18

const String BIN_ID = "BIN-001";

// Calibration
const float BIN_HEIGHT = 24.0;
const float FULL_DISTANCE = 3.0;

const int NUM_SAMPLES = 5;

// ---------------- WiFi CONFIG ----------------
const char* WIFI_SSID     = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// ---------------- BACKEND CONFIG ----------------
// Your Render backend URL + the dedicated sensor route.
// Example: "https://cleanvillage-backend.onrender.com/api/sensor/update"
const char* SERVER_URL = "https://YOUR-BACKEND.onrender.com/api/sensor/update";

// Must match DEVICE_API_KEY in the backend's .env exactly.
const char* DEVICE_API_KEY = "YOUR_DEVICE_API_KEY";

// How often to send a reading to the backend.
const unsigned long SEND_INTERVAL_MS = 5000; // every 5 seconds

// Retry behavior if a POST fails.
const int MAX_RETRIES = 3;
const unsigned long RETRY_DELAY_MS = 1500;

unsigned long lastSendTime = 0;

float getDistance();
int getFillPercentage(float distance);
String getStatus(int fill);
void connectWiFi();
bool sendReadingToServer(int fillLevel);

void setup() {

  Serial.begin(115200);

  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);

  digitalWrite(TRIG_PIN, LOW);

  Serial.println();
  Serial.println("========================================");
  Serial.println(" CLEANVILLAGE AI");
  Serial.println(" SMART WASTE MANAGEMENT");
  Serial.println("========================================");
  Serial.print("Bin ID : ");
  Serial.println(BIN_ID);
  Serial.println();

  connectWiFi();
}

void loop() {

  // Keep WiFi alive; reconnect silently if it drops.
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi disconnected. Reconnecting...");
    connectWiFi();
  }

  float distance = getDistance();

  if (distance == -1) {

    Serial.println("----------------------------------------");
    Serial.print("Bin ID : ");
    Serial.println(BIN_ID);

    Serial.println("Sensor Status : NO ECHO RECEIVED");

    Serial.println("----------------------------------------");
    Serial.println();

    delay(1000);
    return;
  }

  int fill = getFillPercentage(distance);

  String status = getStatus(fill);

  Serial.println("----------------------------------------");

  Serial.print("Bin ID          : ");
  Serial.println(BIN_ID);

  Serial.print("Distance        : ");
  Serial.print(distance,1);
  Serial.println(" cm");

  Serial.print("Fill Percentage : ");
  Serial.print(fill);
  Serial.println("%");

  Serial.print("Waste Status    : ");
  Serial.println(status);

  Serial.println("----------------------------------------");
  Serial.println();

  // Only POST every SEND_INTERVAL_MS, not on every loop iteration
  // (loop already runs roughly once per second because of the trailing
  // delay(1000), so this throttles network calls independently of that).
  unsigned long now = millis();
  if (now - lastSendTime >= SEND_INTERVAL_MS) {
    lastSendTime = now;
    sendReadingToServer(fill);
  }

  delay(1000);
}

float getDistance() {

  float total = 0;
  int count = 0;

  for(int i=0;i<NUM_SAMPLES;i++){

    digitalWrite(TRIG_PIN,LOW);
    delayMicroseconds(2);

    digitalWrite(TRIG_PIN,HIGH);
    delayMicroseconds(10);

    digitalWrite(TRIG_PIN,LOW);

    long duration = pulseIn(ECHO_PIN,HIGH,40000);

    if(duration==0)
      continue;

    float distance = duration * 0.0343 / 2.0;

    if(distance>=2 && distance<=30){

      total += distance;
      count++;
    }

    delay(20);
  }

  if(count==0)
    return -1;

  return total/count;
}

int getFillPercentage(float distance){

  float fill =
      ((BIN_HEIGHT-distance)/
      (BIN_HEIGHT-FULL_DISTANCE))*100.0;

  fill = constrain(fill,0,100);

  return (int)(fill+0.5);
}

String getStatus(int fill){

  if(fill>=90)
    return "FULL";

  if(fill>=70)
    return "ALMOST FULL";

  if(fill>=20)
    return "NORMAL";

  return "EMPTY";
}

// ================= NEW: WiFi + networking =================

void connectWiFi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  Serial.print("Connecting to WiFi");

  unsigned long startAttempt = millis();
  const unsigned long WIFI_TIMEOUT_MS = 15000;

  while (WiFi.status() != WL_CONNECTED && (millis() - startAttempt) < WIFI_TIMEOUT_MS) {
    delay(400);
    Serial.print(".");
  }

  Serial.println();

  if (WiFi.status() == WL_CONNECTED) {
    Serial.print("WiFi connected. IP address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("WiFi connection FAILED (will retry in main loop).");
  }
}

/**
 * Builds the JSON payload {"binId":"BIN-001","fillLevel":64} and POSTs it
 * to SERVER_URL with the device key in the x-device-key header. Retries
 * up to MAX_RETRIES times with a short delay between attempts, and prints
 * clear diagnostics for every outcome (success, HTTP error, or
 * connection failure).
 */
bool sendReadingToServer(int fillLevel) {

  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Skipping send: WiFi not connected.");
    return false;
  }

  // Build JSON payload
  StaticJsonDocument<128> doc;
  doc["binId"] = BIN_ID;
  doc["fillLevel"] = fillLevel;

  String payload;
  serializeJson(doc, payload);

  for (int attempt = 1; attempt <= MAX_RETRIES; attempt++) {

    HTTPClient http;
    http.begin(SERVER_URL);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("x-device-key", DEVICE_API_KEY);
    http.setTimeout(8000);

    Serial.print("Sending reading to server (attempt ");
    Serial.print(attempt);
    Serial.print("/");
    Serial.print(MAX_RETRIES);
    Serial.println(")...");
    Serial.print("Payload: ");
    Serial.println(payload);

    int httpCode = http.POST(payload);

    if (httpCode > 0) {
      String response = http.getString();

      if (httpCode >= 200 && httpCode < 300) {
        Serial.print("Server accepted reading. HTTP ");
        Serial.println(httpCode);
        Serial.print("Response: ");
        Serial.println(response);
        http.end();
        return true;
      } else {
        Serial.print("Server rejected reading. HTTP ");
        Serial.println(httpCode);
        Serial.print("Response: ");
        Serial.println(response);
        // 4xx (e.g. bad device key, bad payload) won't fix itself by
        // retrying, so stop early.
        if (httpCode >= 400 && httpCode < 500) {
          http.end();
          return false;
        }
      }
    } else {
      Serial.print("HTTP POST failed. Error: ");
      Serial.println(http.errorToString(httpCode).c_str());
    }

    http.end();

    if (attempt < MAX_RETRIES) {
      Serial.print("Retrying in ");
      Serial.print(RETRY_DELAY_MS / 1000.0, 1);
      Serial.println("s...");
      delay(RETRY_DELAY_MS);
    }
  }

  Serial.println("Failed to send reading after all retries. Will try again next cycle.");
  return false;
}
