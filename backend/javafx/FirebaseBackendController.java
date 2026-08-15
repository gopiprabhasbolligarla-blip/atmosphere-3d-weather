package com.weather.backend;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Instant;

/**
 * JavaFX Firebase Backend Controller
 * Manages user login counts and search history persistence in Google Firebase Realtime Database / Firestore.
 */
public class FirebaseBackendController {

    private static final String FIREBASE_PROJECT_ID = "myweatherapp-4678c";
    private static final String FIREBASE_DB_URL = "https://myweatherapp-4678c-default-rtdb.firebaseio.com";
    private final HttpClient httpClient;

    public FirebaseBackendController() {
        this.httpClient = HttpClient.newHttpClient();
    }

    /**
     * Increment user login count in Firebase
     * @param userId Unique user identifier / phone number
     */
    public void recordUserLogin(String userId) {
        try {
            String sanitizedId = userId.replaceAll("[^a-zA-Z0-9]", "_");
            String timestamp = Instant.now().toString();
            
            String jsonPayload = String.format(
                "{\"userId\":\"%s\", \"lastLogin\":\"%s\", \"loginCount\": 1}",
                sanitizedId, timestamp
            );

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(FIREBASE_DB_URL + "/users/" + sanitizedId + ".json"))
                    .header("Content-Type", "application/json")
                    .PUT(HttpRequest.BodyPublishers.ofString(jsonPayload))
                    .build();

            httpClient.sendAsync(request, HttpResponse.BodyHandlers.ofString())
                    .thenAccept(response -> {
                        System.out.println("[JavaFX Firebase Backend] Login count updated for: " + sanitizedId);
                    });

        } catch (Exception e) {
            System.err.println("[JavaFX Firebase Backend Error] " + e.getMessage());
        }
    }

    /**
     * Save city search history to user profile in Firebase
     * @param userId User phone / ID
     * @param cityName Searched location
     */
    public void recordSearchHistory(String userId, String cityName) {
        try {
            String sanitizedId = userId.replaceAll("[^a-zA-Z0-9]", "_");
            String timestamp = Instant.now().toString();

            String jsonPayload = String.format(
                "{\"cityName\":\"%s\", \"timestamp\":\"%s\"}",
                cityName, timestamp
            );

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(FIREBASE_DB_URL + "/history/" + sanitizedId + ".json"))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                    .build();

            httpClient.sendAsync(request, HttpResponse.BodyHandlers.ofString())
                    .thenAccept(response -> {
                        System.out.println("[JavaFX Firebase Backend] Saved search history: " + cityName);
                    });

        } catch (Exception e) {
            System.err.println("[JavaFX Firebase Search History Error] " + e.getMessage());
        }
    }
}
