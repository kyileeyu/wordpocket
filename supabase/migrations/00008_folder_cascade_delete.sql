-- Change decks.folder_id FK from SET NULL to CASCADE
-- so deleting a folder also deletes its decks (and cards, card_states, review_logs via existing cascades)
ALTER TABLE decks
  DROP CONSTRAINT decks_folder_id_fkey,
  ADD CONSTRAINT decks_folder_id_fkey
    FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE CASCADE;
