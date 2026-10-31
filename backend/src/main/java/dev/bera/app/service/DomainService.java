package dev.bera.app.service;

import static dev.bera.app.common.Input.*;

import com.fasterxml.jackson.databind.*;
import dev.bera.app.common.*;
import dev.bera.app.model.*;
import dev.bera.app.repository.*;
import java.time.*;
import java.util.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DomainService {

  private final BoardRepository boards;
  private final StageRepository stages;
  private final CardRepository cards;

  public DomainService(
    BoardRepository boards,
    StageRepository stages,
    CardRepository cards
  ) {
    this.boards = boards;
    this.stages = stages;
    this.cards = cards;
  }

  public List<Board> boards() {
    return boards.findAll(org.springframework.data.domain.Sort.by("createdAt"));
  }

  @Transactional
  public Board createBoard(JsonNode j) {
    var b = new Board();
    b.name = text(j, "name", 100, true);
    b.description = text(j, "description", 500, false);
    boards.save(b);
    int pos = 0;
    for (var n : List.of("Yapılacak", "Devam ediyor", "Tamamlandı")) {
      var s = new Stage();
      s.boardId = b.id;
      s.name = n;
      s.position = pos++;
      stages.save(s);
    }
    return b;
  }

  public Map<String, Object> board(UUID id) {
    var b = found(boards.findById(id));
    return Map.of(
      "board",
      b,
      "stages",
      stages
        .findByBoardIdOrderByPosition(id)
        .stream()
        .map(s ->
          Map.of("stage", s, "cards", cards.findByStageIdOrderByCreatedAt(s.id))
        )
        .toList()
    );
  }

  @Transactional
  public Stage stage(UUID id, JsonNode j) {
    found(boards.lock(id));
    var s = new Stage();
    s.boardId = id;
    s.name = text(j, "name", 60, true);
    s.position = stages.findByBoardIdOrderByPosition(id).size();
    return stages.save(s);
  }

  @Transactional
  public Card createCard(JsonNode j) {
    var c = new Card();
    c.stageId = id(j, "stageId");
    found(stages.findById(c.stageId));
    apply(c, j);
    return cards.save(c);
  }

  @Transactional
  public Card updateCard(UUID id, JsonNode j) {
    var c = found(cards.lock(id));
    apply(c, j);
    return cards.save(c);
  }

  private void apply(Card c, JsonNode j) {
    c.title = text(j, "title", 160, true);
    c.description = text(j, "description", 2000, false);
    c.assignee = text(j, "assignee", 80, false);
    c.label = text(j, "label", 30, false);
    c.priority = choice(j, "priority", "LOW", "NORMAL", "HIGH");
    c.dueDate =
      j.hasNonNull("dueDate") && !j.path("dueDate").asText().isBlank()
        ? date(j, "dueDate")
        : null;
  }

  @Transactional
  public Card move(UUID id, JsonNode j) {
    var c = found(cards.lock(id));
    var from = found(stages.findById(c.stageId));
    var to = found(stages.findById(id(j, "stageId")));
    if (!from.boardId.equals(to.boardId)) throw new ApiException(
      409,
      "Kart başka panoya taşınamaz."
    );
    c.stageId = to.id;
    return cards.save(c);
  }

  @Transactional
  public void delete(UUID id) {
    cards.delete(found(cards.lock(id)));
  }
}
