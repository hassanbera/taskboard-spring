package dev.bera.app.model;

import jakarta.persistence.*;
import java.time.*;
import java.util.UUID;

@Entity
@Table(name = "stages")
public class Stage {

  @Id
  public UUID id = UUID.randomUUID();

  @Column(nullable = false)
  public Instant createdAt = Instant.now();

  @Column(name = "board_id")
  public UUID boardId = null;

  @Column(name = "name", length = 60)
  public String name = "";

  @Column(name = "position")
  public int position = 0;
}
