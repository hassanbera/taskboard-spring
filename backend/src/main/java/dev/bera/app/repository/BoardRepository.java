package dev.bera.app.repository;

import dev.bera.app.model.Board;
import jakarta.persistence.LockModeType;
import java.util.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

public interface BoardRepository extends JpaRepository<Board, UUID> {
  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @Query("select x from Board x where x.id=:id")
  Optional<Board> lock(@Param("id") UUID id);
}
