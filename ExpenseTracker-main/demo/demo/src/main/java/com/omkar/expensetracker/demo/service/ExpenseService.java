package com.omkar.expensetracker.demo.service;

import com.omkar.expensetracker.demo.model.Expense;
import com.omkar.expensetracker.demo.model.RecurrenceFrequency;
import com.omkar.expensetracker.demo.model.User;
import com.omkar.expensetracker.demo.repository.ExpenseRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class ExpenseService {

    private final ExpenseRepository expenseRepository;

    public ExpenseService(ExpenseRepository expenseRepository) {
        this.expenseRepository = expenseRepository;
    }

    public Expense createExpense(Expense expense) {
        normalizeRecurringFields(expense);
        return expenseRepository.save(expense);
    }

    public List<Expense> getExpensesByUser(User user) {
        generateRecurringExpenses(user);
        return expenseRepository.findByUserAndRecurringTemplateFalseOrUserAndRecurringTemplateIsNullOrderByExpenseDateDesc(user, user);
    }

    public void deleteExpense(Long id) {
        expenseRepository.deleteById(id);
    }

    public Expense getExpenseById(Long id) {
        return expenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found"));
    }

    public Expense updateExpense(Long id, Expense updatedExpense) {
        Expense existing = getExpenseById(id);

        existing.setDescription(updatedExpense.getDescription());
        existing.setCategory(updatedExpense.getCategory());
        existing.setAmount(updatedExpense.getAmount());
        existing.setExpenseDate(updatedExpense.getExpenseDate());

        return expenseRepository.save(existing);
    }

    public Double getTotalExpense(User user) {
        return expenseRepository.sumByUser(user);
    }

    private void normalizeRecurringFields(Expense expense) {
        if (!expense.isRecurringTemplate() || expense.getRecurrenceFrequency() == null || expense.getRecurrenceFrequency() == RecurrenceFrequency.NONE) {
            expense.setRecurringTemplate(false);
            expense.setRecurrenceFrequency(RecurrenceFrequency.NONE);
            expense.setRecurrenceEndDate(null);
            expense.setLastGeneratedDate(null);
            expense.setRecurrenceTemplateId(null);
            return;
        }

        expense.setLastGeneratedDate(expense.getExpenseDate());
        expense.setRecurrenceTemplateId(null);
    }

    private void generateRecurringExpenses(User user) {
        List<Expense> templates = expenseRepository.findByUserAndRecurringTemplateTrue(user);
        LocalDate today = LocalDate.now();

        for (Expense template : templates) {
            LocalDate limit = template.getRecurrenceEndDate() != null && template.getRecurrenceEndDate().isBefore(today)
                    ? template.getRecurrenceEndDate()
                    : today;

            if (template.getExpenseDate() == null || template.getExpenseDate().isAfter(limit)) {
                continue;
            }

            if (!expenseRepository.existsByUserAndRecurrenceTemplateIdAndExpenseDate(user, template.getId(), template.getExpenseDate())) {
                expenseRepository.save(buildOccurrence(template, template.getExpenseDate()));
            }

            LocalDate nextDate = incrementDate(
                    template.getLastGeneratedDate() != null ? template.getLastGeneratedDate() : template.getExpenseDate(),
                    template.getRecurrenceFrequency()
            );

            while (nextDate != null && !nextDate.isAfter(limit)) {
                if (!expenseRepository.existsByUserAndRecurrenceTemplateIdAndExpenseDate(user, template.getId(), nextDate)) {
                    expenseRepository.save(buildOccurrence(template, nextDate));
                }

                template.setLastGeneratedDate(nextDate);
                nextDate = incrementDate(nextDate, template.getRecurrenceFrequency());
            }

            expenseRepository.save(template);
        }
    }

    private Expense buildOccurrence(Expense template, LocalDate occurrenceDate) {
        Expense occurrence = new Expense();
        occurrence.setDescription(template.getDescription());
        occurrence.setCategory(template.getCategory());
        occurrence.setAmount(template.getAmount());
        occurrence.setExpenseDate(occurrenceDate);
        occurrence.setUser(template.getUser());
        occurrence.setRecurringTemplate(false);
        occurrence.setRecurrenceFrequency(RecurrenceFrequency.NONE);
        occurrence.setRecurrenceEndDate(null);
        occurrence.setLastGeneratedDate(null);
        occurrence.setRecurrenceTemplateId(template.getId());
        return occurrence;
    }

    private LocalDate incrementDate(LocalDate currentDate, RecurrenceFrequency frequency) {
        if (currentDate == null || frequency == null) {
            return null;
        }

        return switch (frequency) {
            case DAILY -> currentDate.plusDays(1);
            case WEEKLY -> currentDate.plusWeeks(1);
            case MONTHLY -> currentDate.plusMonths(1);
            case YEARLY -> currentDate.plusYears(1);
            case NONE -> null;
        };
    }
}
