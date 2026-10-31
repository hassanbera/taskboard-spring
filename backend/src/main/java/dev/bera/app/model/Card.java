package dev.bera.app.model;

import jakarta.persistence.*;
import java.time.*;
import java.util.UUID;

@Entity
@Table(name = "cards")
public class Card {

  @Id
  public UUID id = UUID.randomUUID();

  @Column(nullable = false)
  public Instant createdAt = Instant.now();

  @Column(name = "stage_id")
  public UUID stageId = null;

  @Column(name = "title", length = 160)
  public String title = "";

  @Column(name = "description", length = 2000)
  public String description = "";

  @Column(name = "assignee", length = 80)
  public String assignee = "";

  @Column(name = "label", length = 30)
  public String label = "Genel";

  @Column(name = "priority", length = 10)
  public String priority = "NORMAL";

  @Column(name = "due_date")
  public LocalDate dueDate = null;
}
