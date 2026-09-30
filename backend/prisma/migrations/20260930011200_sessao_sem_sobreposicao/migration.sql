CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE "Sessao"
ADD CONSTRAINT "Sessao_sala_horario_excl"
EXCLUDE USING gist (
  "salaId" WITH =,
  tsrange("inicio", "fim", '[)') WITH &&
);
