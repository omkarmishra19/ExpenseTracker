package com.omkar.expensetracker.demo.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Getter
@Setter
public class Expense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String description;

    @Enumerated(EnumType.STRING)
    private ExpenseCategory category;

    private Double amount;

    private LocalDate expenseDate;

    private boolean recurringTemplate;

    @Enumerated(EnumType.STRING)
    private RecurrenceFrequency recurrenceFrequency = RecurrenceFrequency.NONE;

    private LocalDate recurrenceEndDate;

    private LocalDate lastGeneratedDate;

    private Long recurrenceTemplateId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonIgnore
    private User user;

}
