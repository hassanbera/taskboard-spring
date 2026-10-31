package dev.bera.app.controller;

import com.fasterxml.jackson.databind.JsonNode;
import dev.bera.app.service.DomainService;
import java.util.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class ApiController {

  private final DomainService service;
  private final JdbcTemplate db;

  public ApiController(DomainService service, JdbcTemplate db) {
    this.service = service;
    this.db = db;
  }

  @GetMapping("/health")
  public Object health() {
    db.queryForObject("SELECT 1", Integer.class);
    return Map.of("data", Map.of("status", "ok"));
  }

  @GetMapping("/boards")
  public Object action0() {
    return Map.of("data", service.boards());
  }

  @PostMapping("/boards")
  public Object action1(@RequestBody JsonNode j) {
    return Map.of("data", service.createBoard(j));
  }

  @GetMapping("/boards/{id}")
  public Object action2(@PathVariable UUID id) {
    return Map.of("data", service.board(id));
  }

  @PostMapping("/boards/{id}/stages")
  public Object action3(@PathVariable UUID id, @RequestBody JsonNode j) {
    return Map.of("data", service.stage(id, j));
  }

  @PostMapping("/cards")
  public Object action4(@RequestBody JsonNode j) {
    return Map.of("data", service.createCard(j));
  }

  @PutMapping("/cards/{id}")
  public Object action5(@PathVariable UUID id, @RequestBody JsonNode j) {
    return Map.of("data", service.updateCard(id, j));
  }

  @PatchMapping("/cards/{id}/move")
  public Object action6(@PathVariable UUID id, @RequestBody JsonNode j) {
    return Map.of("data", service.move(id, j));
  }

  @DeleteMapping("/cards/{id}")
  public Object action7(@PathVariable UUID id) {
    service.delete(id);
    return Map.of("data", true);
  }
}
