package com.weather.backend;

import javafx.application.Application;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.scene.layout.*;
import javafx.scene.paint.Color;
import javafx.stage.Stage;

/**
 * WeatherDashboardJavaFX
 * Modern JavaFX Desktop GUI with Firebase User Login Counter & History Integration.
 */
public class WeatherDashboardJavaFX extends Application {

    private final FirebaseBackendController firebaseController = new FirebaseBackendController();
    private String currentUserId = "guest_user";
    private Label loginCountLabel;
    private Label weatherDisplayLabel;

    @Override
    public void start(Stage primaryStage) {
        primaryStage.setTitle("Atmosphere 3D Weather Dashboard (JavaFX Desktop)");

        // Header Panel
        Label titleLabel = new Label("Atmosphere Weather Desktop");
        titleLabel.setStyle("-fx-font-size: 20px; -fx-font-weight: bold; -fx-text-fill: white;");

        loginCountLabel = new Label("User Session: Logged in (Count Tracked in Firebase)");
        loginCountLabel.setStyle("-fx-font-size: 12px; -fx-text-fill: #38bdf8;");

        VBox headerBox = new VBox(5, titleLabel, loginCountLabel);
        headerBox.setPadding(new Insets(15));
        headerBox.setStyle("-fx-background-color: #0f172a; -fx-background-radius: 12px;");

        // Mobile Login Input Simulation
        TextField phoneField = new TextField();
        phoneField.setPromptText("Enter Mobile Number (+91...)");
        phoneField.setStyle("-fx-background-color: #1e293b; -fx-text-fill: white; -fx-prompt-text-fill: #94a3b8;");

        Button loginBtn = new Button("Verify & Track Login");
        loginBtn.setStyle("-fx-background-color: #2563eb; -fx-text-fill: white; -fx-font-weight: bold;");
        loginBtn.setOnAction(e -> {
            String phone = phoneField.getText().trim();
            if (!phone.isEmpty()) {
                currentUserId = phone;
                firebaseController.recordUserLogin(currentUserId);
                loginCountLabel.setText("Logged in as: " + currentUserId + " (Login recorded in Firebase)");
            }
        });

        HBox authBox = new HBox(10, phoneField, loginBtn);
        authBox.setAlignment(Pos.CENTER_LEFT);

        // Location Search Input
        TextField cityField = new TextField();
        cityField.setPromptText("Enter City (e.g. New York, London, Tokyo)");
        cityField.setStyle("-fx-background-color: #1e293b; -fx-text-fill: white; -fx-prompt-text-fill: #94a3b8;");

        Button searchBtn = new Button("Search Weather");
        searchBtn.setStyle("-fx-background-color: #10b981; -fx-text-fill: #090d16; -fx-font-weight: bold;");

        weatherDisplayLabel = new Label("Weather condition will display here...");
        weatherDisplayLabel.setStyle("-fx-font-size: 14px; -fx-text-fill: #e2e8f0;");

        searchBtn.setOnAction(e -> {
            String city = cityField.getText().trim();
            if (!city.isEmpty()) {
                weatherDisplayLabel.setText("Weather for " + city + ": 24°C Sunny, Clear Sky");
                firebaseController.recordSearchHistory(currentUserId, city);
            }
        });

        HBox searchBox = new HBox(10, cityField, searchBtn);
        searchBox.setAlignment(Pos.CENTER_LEFT);

        // Main Layout Container
        VBox root = new VBox(20, headerBox, authBox, searchBox, weatherDisplayLabel);
        root.setPadding(new Insets(20));
        root.setStyle("-fx-background-color: #020617;");

        Scene scene = new Scene(root, 650, 450);
        primaryStage.setScene(scene);
        primaryStage.show();
    }

    public static void main(String[] args) {
        launch(args);
    }

    public FirebaseBackendController getFirebaseController() {
        return firebaseController;
    }
}
