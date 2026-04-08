package com.omkar.expensetracker.demo.repository;

import com.omkar.expensetracker.demo.model.Expense;
import com.omkar.expensetracker.demo.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.time.LocalDate;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    List<Expense> findByUser(User user);
    List<Expense> findByUserAndRecurringTemplateTrue(User user);
    List<Expense> findByUserAndRecurringTemplateFalseOrUserAndRecurringTemplateIsNullOrderByExpenseDateDesc(User user, User sameUser);
    boolean existsByUserAndRecurrenceTemplateIdAndExpenseDate(User user, Long recurrenceTemplateId, LocalDate expenseDate);
    Optional<Expense> findById(Long id);
    @Query("SELECT SUM(e.amount) FROM Expense e WHERE e.user = :user")
    Double sumByUser(@Param("user") User user);

}
