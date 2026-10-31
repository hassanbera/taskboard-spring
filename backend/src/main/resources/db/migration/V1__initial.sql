CREATE TABLE boards (id uuid PRIMARY KEY, created_at timestamptz NOT NULL,
 name varchar(100) NOT NULL,
 description varchar(500) NOT NULL);
CREATE TABLE stages (id uuid PRIMARY KEY, created_at timestamptz NOT NULL,
 board_id uuid NOT NULL,
 name varchar(60) NOT NULL,
 position integer NOT NULL);
CREATE TABLE cards (id uuid PRIMARY KEY, created_at timestamptz NOT NULL,
 stage_id uuid NOT NULL,
 title varchar(160) NOT NULL,
 description varchar(2000) NOT NULL,
 assignee varchar(80) NOT NULL,
 label varchar(30) NOT NULL,
 priority varchar(10) NOT NULL,
 due_date date);
ALTER TABLE stages ADD FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE;
ALTER TABLE cards ADD FOREIGN KEY (stage_id) REFERENCES stages(id) ON DELETE CASCADE;
CREATE INDEX ON stages(board_id,position);
CREATE INDEX ON cards(stage_id,created_at);
ALTER TABLE cards ADD CHECK (priority IN ('LOW','NORMAL','HIGH'));
