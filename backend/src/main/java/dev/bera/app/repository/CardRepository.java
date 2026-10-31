package dev.bera.app.repository;

import dev.bera.app.model.Card;
import jakarta.persistence.LockModeType;
import java.util.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

public interface CardRepository extends JpaRepository<Card, UUID> {
  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @Query("select x from Card x where x.id=:id")
  Optional<Card> lock(@Param("id") UUID id);

  List<Card> findByStageIdOrderByCreatedAt(UUID id);
}
