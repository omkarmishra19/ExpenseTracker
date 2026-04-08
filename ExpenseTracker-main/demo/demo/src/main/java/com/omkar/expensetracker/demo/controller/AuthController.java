package com.omkar.expensetracker.demo.controller;

import com.omkar.expensetracker.demo.model.User;
import com.omkar.expensetracker.demo.repository.UserRepository;
import com.omkar.expensetracker.demo.security.JwtUtil;
import com.omkar.expensetracker.demo.security.dto.ForgotPasswordRequest;
import com.omkar.expensetracker.demo.security.dto.LoginRequest;
import com.omkar.expensetracker.demo.security.dto.ResetPasswordRequest;
import com.omkar.expensetracker.demo.security.dto.SignupRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Random;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequest request) {
        String username = request.getUsername() == null ? "" : request.getUsername().trim();
        String fullName = request.getFullName() == null ? "" : request.getFullName().trim();
        String email = request.getEmail() == null ? "" : request.getEmail().trim();
        String password = request.getPassword() == null ? "" : request.getPassword().trim();

        if (username.isEmpty()) {
            return ResponseEntity.badRequest().body("Username is required");
        }

        if (fullName.isEmpty()) {
            return ResponseEntity.badRequest().body("Full name is required");
        }

        if (email.isEmpty()) {
            return ResponseEntity.badRequest().body("Email is required");
        }

        if (!password.matches("\\d{6}")) {
            return ResponseEntity.badRequest().body("Password must be exactly 6 digits");
        }

        if (userRepository.findByUsername(username).isPresent()) {
            return ResponseEntity.badRequest().body("Username already exists");
        }

        if (userRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.badRequest().body("Email already exists");
        }

        User user = new User();
        user.setUsername(username);
        user.setName(fullName);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setProvider("LOCAL");
        user.setRole("USER");

        userRepository.save(user);

        return ResponseEntity.ok("Signup successful");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        if (request.getEmail() == null || request.getPassword() == null) {
            return ResponseEntity.status(401).body("Invalid credentials");
        }

        User user = userRepository.findByEmail(request.getEmail().trim())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return ResponseEntity.status(401).body("Invalid credentials");
        }

        String token = JwtUtil.generateToken(user.getEmail());

        return ResponseEntity.ok(token);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        String email = request.getEmail() == null ? "" : request.getEmail().trim();

        if (email.isEmpty()) {
            return ResponseEntity.badRequest().body("Email is required");
        }

        User user = userRepository.findByEmail(email)
                .orElse(null);

        if (user == null) {
            return ResponseEntity.ok(Map.of(
                    "message", "If the email exists, a reset code has been generated."
            ));
        }

        String resetToken = String.format("%06d", new Random().nextInt(1_000_000));
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(15);

        user.setPasswordResetToken(resetToken);
        user.setPasswordResetTokenExpiry(expiresAt);
        userRepository.save(user);

        return ResponseEntity.ok(Map.of(
                "message", "Reset code generated successfully.",
                "resetToken", resetToken,
                "expiresAt", expiresAt.toString()
        ));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        String email = request.getEmail() == null ? "" : request.getEmail().trim();
        String token = request.getToken() == null ? "" : request.getToken().trim();
        String newPassword = request.getNewPassword() == null ? "" : request.getNewPassword().trim();

        if (email.isEmpty() || token.isEmpty() || newPassword.isEmpty()) {
            return ResponseEntity.badRequest().body("Email, token, and new password are required");
        }

        if (!newPassword.matches("\\d{6}")) {
            return ResponseEntity.badRequest().body("New password must be exactly 6 digits");
        }

        User user = userRepository.findByEmailAndPasswordResetToken(email, token)
                .orElseThrow(() -> new RuntimeException("Invalid reset token"));

        if (user.getPasswordResetTokenExpiry() == null || user.getPasswordResetTokenExpiry().isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest().body("Reset token has expired");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setPasswordResetToken(null);
        user.setPasswordResetTokenExpiry(null);
        userRepository.save(user);

        return ResponseEntity.ok("Password reset successful");
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(Authentication authentication) {
        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(Map.of(
                "username", user.getUsername(),
                "fullName", user.getName(),
                "email", user.getEmail()
        ));
    }
}
