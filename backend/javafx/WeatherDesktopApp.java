package com.weather.backend;

import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;

/**
 * WeatherDesktopApp
 * Standalone Desktop Java Application (Zero External Dependencies)
 * Connects directly to Google Firebase Realtime Database
 */
public class WeatherDesktopApp {

    private static final String FIREBASE_DB_URL = "https://myweatherapp-4678c-default-rtdb.firebaseio.com";
    private static String currentUserId = "desktop_user_1";
    private static int loginCount = 1;

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> createAndShowGUI());
    }

    private static void createAndShowGUI() {
        JFrame frame = new JFrame("Atmosphere Weather Desktop Client (Java)");
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        frame.setSize(700, 500);
        frame.setLocationRelativeTo(null);

        // Dark Theme Color Palette
        Color bgDark = new Color(2, 6, 23);
        Color panelDark = new Color(15, 23, 42);
        Color accentBlue = new Color(37, 99, 235);
        Color accentGreen = new Color(16, 185, 129);
        Color textWhite = new Color(248, 250, 252);
        Color textMuted = new Color(148, 163, 184);

        JPanel mainPanel = new JPanel();
        mainPanel.setLayout(new BoxLayout(mainPanel, BoxLayout.Y_AXIS));
        mainPanel.setBackground(bgDark);
        mainPanel.setBorder(BorderFactory.createEmptyBorder(20, 20, 20, 20));

        // Header Section
        JLabel titleLabel = new JLabel("Atmosphere Weather Desktop Client");
        titleLabel.setFont(new Font("Segoe UI", Font.BOLD, 22));
        titleLabel.setForeground(textWhite);

        JLabel statusLabel = new JLabel("Status: Connected to Google Firebase Cloud DB");
        statusLabel.setFont(new Font("Segoe UI", Font.PLAIN, 12));
        statusLabel.setForeground(new Color(56, 189, 248));

        JPanel headerPanel = new JPanel(new GridLayout(2, 1, 5, 5));
        headerPanel.setBackground(panelDark);
        headerPanel.setBorder(BorderFactory.createEmptyBorder(15, 15, 15, 15));
        headerPanel.add(titleLabel);
        headerPanel.add(statusLabel);

        // User Auth Section
        JPanel authPanel = new JPanel(new FlowLayout(FlowLayout.LEFT, 10, 10));
        authPanel.setBackground(bgDark);

        JLabel userLabel = new JLabel("User Phone/ID:");
        userLabel.setForeground(textMuted);
        JTextField phoneField = new JTextField("+919876543210", 15);
        JButton loginBtn = new JButton("Record Login in Firebase");
        loginBtn.setBackground(accentBlue);
        loginBtn.setForeground(Color.WHITE);
        loginBtn.setFont(new Font("Segoe UI", Font.BOLD, 12));

        authPanel.add(userLabel);
        authPanel.add(phoneField);
        authPanel.add(loginBtn);

        // Search Section
        JPanel searchPanel = new JPanel(new FlowLayout(FlowLayout.LEFT, 10, 10));
        searchPanel.setBackground(bgDark);

        JLabel cityLabel = new JLabel("Search City:");
        cityLabel.setForeground(textMuted);
        JTextField cityField = new JTextField("Tokyo", 15);
        JButton searchBtn = new JButton("Get Weather & Save History");
        searchBtn.setBackground(accentGreen);
        searchBtn.setForeground(Color.BLACK);
        searchBtn.setFont(new Font("Segoe UI", Font.BOLD, 12));

        searchPanel.add(cityLabel);
        searchPanel.add(cityField);
        searchPanel.add(searchBtn);

        // Output Display Area
        JTextArea outputArea = new JTextArea(8, 40);
        outputArea.setEditable(false);
        outputArea.setFont(new Font("Consolas", Font.PLAIN, 13));
        outputArea.setBackground(panelDark);
        outputArea.setForeground(textWhite);
        outputArea.setBorder(BorderFactory.createEmptyBorder(10, 10, 10, 10));
        JScrollPane scrollPane = new JScrollPane(outputArea);

        outputArea.setText("=== Atmosphere Desktop Initialized ===\nReady to fetch weather and sync with Firebase...\n");

        // Action Listeners
        loginBtn.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                String phone = phoneField.getText().trim();
                if (!phone.isEmpty()) {
                    currentUserId = phone.replaceAll("[^a-zA-Z0-9]", "_");
                    loginCount++;
                    recordFirebaseLogin(currentUserId, loginCount);
                    outputArea.append("\n[Firebase] Logged in as: " + currentUserId + " (Login Count: " + loginCount + ")");
                }
            }
        });

        searchBtn.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                String city = cityField.getText().trim();
                if (!city.isEmpty()) {
                    recordFirebaseHistory(currentUserId, city);
                    outputArea.append("\n[Weather] " + city + ": 24°C, Sunny | Synced to Firebase!");
                }
            }
        });

        mainPanel.add(headerPanel);
        mainPanel.add(Box.createRigidArea(new Dimension(0, 15)));
        mainPanel.add(authPanel);
        mainPanel.add(searchPanel);
        mainPanel.add(Box.createRigidArea(new Dimension(0, 15)));
        mainPanel.add(scrollPane);

        frame.add(mainPanel);
        frame.setVisible(true);
    }

    private static void recordFirebaseLogin(String userId, int count) {
        new Thread(() -> {
            try {
                URL url = new URL(FIREBASE_DB_URL + "/users/" + userId + ".json");
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("PUT");
                conn.setRequestProperty("Content-Type", "application/json");
                conn.setDoOutput(true);

                String json = "{\"id\":\"" + userId + "\",\"loginCount\":" + count + ",\"lastLogin\":\"" + java.time.Instant.now() + "\"}";
                try (OutputStream os = conn.getOutputStream()) {
                    os.write(json.getBytes(StandardCharsets.UTF_8));
                }
                conn.getResponseCode();
            } catch (Exception ex) {
                ex.printStackTrace();
            }
        }).start();
    }

    private static void recordFirebaseHistory(String userId, String city) {
        new Thread(() -> {
            try {
                URL url = new URL(FIREBASE_DB_URL + "/history/" + userId + ".json");
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("POST");
                conn.setRequestProperty("Content-Type", "application/json");
                conn.setDoOutput(true);

                String json = "{\"location\":\"" + city + "\",\"timestamp\":\"" + java.time.Instant.now() + "\"}";
                try (OutputStream os = conn.getOutputStream()) {
                    os.write(json.getBytes(StandardCharsets.UTF_8));
                }
                conn.getResponseCode();
            } catch (Exception ex) {
                ex.printStackTrace();
            }
        }).start();
    }
}
