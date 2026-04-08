package com.omkar.expensetracker.demo.security.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SignupRequest {

    private String username;
    private String fullName;
    private String email;
    private String password;
}
