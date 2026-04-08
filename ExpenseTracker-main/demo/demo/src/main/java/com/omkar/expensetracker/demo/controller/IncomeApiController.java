package com.omkar.expensetracker.demo.controller;

import com.omkar.expensetracker.demo.model.Income;
import com.omkar.expensetracker.demo.model.User;
import com.omkar.expensetracker.demo.service.IncomeService;
import com.omkar.expensetracker.demo.service.UserService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/incomes")
public class IncomeApiController {

    private final IncomeService incomeService;
    private final UserService userService;

    public IncomeApiController(IncomeService incomeService, UserService userService) {
        this.incomeService = incomeService;
        this.userService = userService;
    }

    @PostMapping
    public Income addIncome(@RequestBody Income income, Authentication authentication) {
        String email = authentication.getName();
        User user = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        income.setUser(user);
        return incomeService.createIncome(income);
    }

    @GetMapping
    public List<Income> getIncomes(Authentication authentication) {
        String email = authentication.getName();
        User user = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return incomeService.getIncomeByUser(user);
    }

    @DeleteMapping("/{id}")
    public void deleteIncome(@PathVariable Long id, Authentication authentication) {
        String email = authentication.getName();
        User user = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Income income = incomeService.getIncomeById(id);

        if (!income.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        incomeService.deleteIncome(id);
    }
}
