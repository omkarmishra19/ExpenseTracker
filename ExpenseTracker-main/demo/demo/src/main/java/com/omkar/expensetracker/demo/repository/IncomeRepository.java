package com.omkar.expensetracker.demo.repository;

import com.omkar.expensetracker.demo.model.Income;
import com.omkar.expensetracker.demo.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface IncomeRepository extends JpaRepository<Income, Long> {

    List<Income> findByUser(User user);
    List<Income> findByUserAndRecurringTemplateTrue(User user);
    List<Income> findByUserAndRecurringTemplateFalseOrUserAndRecurringTemplateIsNullOrderByIncomeDateDesc(User user, User sameUser);
    boolean existsByUserAndRecurrenceTemplateIdAndIncomeDate(User user, Long recurrenceTemplateId, LocalDate incomeDate);
}
