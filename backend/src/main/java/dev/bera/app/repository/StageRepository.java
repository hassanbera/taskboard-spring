package dev.bera.app.repository;

import dev.bera.app.model.Stage;
import jakarta.persistence.LockModeType;
import java.util.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

public interface StageRepository extends JpaRepository<Stage, UUID> {
  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @Query("select x from Stage x where x.id=:id")
  Optional<Stage> lock(@Param("id") UUID id);

  List<Stage> findByBoardIdOrderByPosition(UUID id);
}
