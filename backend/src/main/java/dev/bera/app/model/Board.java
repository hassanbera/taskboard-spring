package dev.bera.app.model;

import jakarta.persistence.*;
import java.time.*;
import java.util.UUID;

@Entity
@Table(name = "boards")
public class Board {

  @Id
  public UUID id = UUID.randomUUID();

  @Column(nullable = false)
  public Instant createdAt = Instant.now();

  @Column(name = "name", length = 100)
  public String name = "";

  @Column(name = "description", length = 500)
  public String description = "";
}
