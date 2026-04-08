package com.omkar.expensetracker.demo.controller;

import com.omkar.expensetracker.demo.model.Expense;
import com.omkar.expensetracker.demo.model.User;
import com.omkar.expensetracker.demo.service.ExpenseService;
import com.omkar.expensetracker.demo.service.UserService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/expenses")
public class ExpenseApiController {

    private final ExpenseService expenseService;
    private final UserService userService;

    public ExpenseApiController(
            ExpenseService expenseService,
            UserService userService
    ) {
        this.expenseService = expenseService;
        this.userService = userService;
    }

    // ✅ ADD EXPENSE
    @PostMapping
    public Expense addExpense(
            @RequestBody Expense expense,
            Authentication authentication
    ) {
        String email = authentication.getName();
        User user = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        expense.setUser(user);
        return expenseService.createExpense(expense);
    }

    // ✅ GET ALL EXPENSES (Dashboard)
    @GetMapping
    public List<Expense> getExpenses(Authentication authentication) {
        String email = authentication.getName();
        User user = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return expenseService.getExpensesByUser(user);
    }

    // ✅ GET SINGLE EXPENSE (Edit page)
    @GetMapping("/{id}")
    public Expense getExpenseById(
            @PathVariable Long id,
            Authentication authentication
    ) {
        String email = authentication.getName();
        User user = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Expense expense = expenseService.getExpenseById(id);

        if (!expense.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        return expense;
    }

    // ✅ UPDATE EXPENSE
    @PutMapping("/{id}")
    public Expense updateExpense(
            @PathVariable Long id,
            @RequestBody Expense updatedExpense,
            Authentication authentication
    ) {
        String email = authentication.getName();
        User user = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Expense expense = expenseService.getExpenseById(id);

        if (!expense.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        expense.setDescription(updatedExpense.getDescription());
        expense.setAmount(updatedExpense.getAmount());
        expense.setCategory(updatedExpense.getCategory());
        expense.setExpenseDate(updatedExpense.getExpenseDate());

        return expenseService.updateExpense(id, expense);
    }

    // ✅ DELETE EXPENSE
    @DeleteMapping("/{id}")
    public void deleteExpense(
            @PathVariable Long id,
            Authentication authentication
    ) {
        String email = authentication.getName();
        User user = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Expense expense = expenseService.getExpenseById(id);

        if (!expense.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        expenseService.deleteExpense(id);
    }
}
