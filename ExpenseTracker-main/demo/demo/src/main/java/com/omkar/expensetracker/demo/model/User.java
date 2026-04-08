package com.omkar.expensetracker.demo.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@Setter
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    private String name;

    @Column(unique = true, nullable = false)
    private String email;
    private String password;

    private String provider;

    private String role;

    private String passwordResetToken;

    private LocalDateTime passwordResetTokenExpiry;
}
