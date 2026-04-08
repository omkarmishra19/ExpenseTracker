package com.omkar.expensetracker.demo.repository;

import com.omkar.expensetracker.demo.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByUsername(String username);

    Optional<User> findByEmailAndPasswordResetToken(String email, String passwordResetToken);
}
