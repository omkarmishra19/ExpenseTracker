package com.omkar.expensetracker.demo.service;

import com.omkar.expensetracker.demo.model.Income;
import com.omkar.expensetracker.demo.model.RecurrenceFrequency;
import com.omkar.expensetracker.demo.model.User;
import com.omkar.expensetracker.demo.repository.IncomeRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class IncomeService {

    private final IncomeRepository incomeRepository;

    public IncomeService(IncomeRepository incomeRepository) {
        this.incomeRepository = incomeRepository;
    }

    public Income createIncome(Income income) {
        normalizeRecurringFields(income);
        return incomeRepository.save(income);
    }

    public List<Income> getIncomeByUser(User user) {
        generateRecurringIncomes(user);
        return incomeRepository.findByUserAndRecurringTemplateFalseOrUserAndRecurringTemplateIsNullOrderByIncomeDateDesc(user, user);
    }

    public Income getIncomeById(Long id) {
        return incomeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Income not found"));
    }

    public void deleteIncome(Long id) {
        incomeRepository.deleteById(id);
    }

    private void normalizeRecurringFields(Income income) {
        if (!income.isRecurringTemplate() || income.getRecurrenceFrequency() == null || income.getRecurrenceFrequency() == RecurrenceFrequency.NONE) {
            income.setRecurringTemplate(false);
            income.setRecurrenceFrequency(RecurrenceFrequency.NONE);
            income.setRecurrenceEndDate(null);
            income.setLastGeneratedDate(null);
            income.setRecurrenceTemplateId(null);
            return;
        }

        income.setLastGeneratedDate(income.getIncomeDate());
        income.setRecurrenceTemplateId(null);
    }

    private void generateRecurringIncomes(User user) {
        List<Income> templates = incomeRepository.findByUserAndRecurringTemplateTrue(user);
        LocalDate today = LocalDate.now();

        for (Income template : templates) {
            LocalDate limit = template.getRecurrenceEndDate() != null && template.getRecurrenceEndDate().isBefore(today)
                    ? template.getRecurrenceEndDate()
                    : today;

            if (template.getIncomeDate() == null || template.getIncomeDate().isAfter(limit)) {
                continue;
            }

            if (!incomeRepository.existsByUserAndRecurrenceTemplateIdAndIncomeDate(user, template.getId(), template.getIncomeDate())) {
                incomeRepository.save(buildOccurrence(template, template.getIncomeDate()));
            }

            LocalDate nextDate = incrementDate(
                    template.getLastGeneratedDate() != null ? template.getLastGeneratedDate() : template.getIncomeDate(),
                    template.getRecurrenceFrequency()
            );

            while (nextDate != null && !nextDate.isAfter(limit)) {
                if (!incomeRepository.existsByUserAndRecurrenceTemplateIdAndIncomeDate(user, template.getId(), nextDate)) {
                    incomeRepository.save(buildOccurrence(template, nextDate));
                }

                template.setLastGeneratedDate(nextDate);
                nextDate = incrementDate(nextDate, template.getRecurrenceFrequency());
            }

            incomeRepository.save(template);
        }
    }

    private Income buildOccurrence(Income template, LocalDate occurrenceDate) {
        Income occurrence = new Income();
        occurrence.setDescription(template.getDescription());
        occurrence.setSource(template.getSource());
        occurrence.setAmount(template.getAmount());
        occurrence.setIncomeDate(occurrenceDate);
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
