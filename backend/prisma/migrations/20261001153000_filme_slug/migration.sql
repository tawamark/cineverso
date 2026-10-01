ALTER TABLE "Filme" ADD COLUMN "slug" TEXT;

UPDATE "Filme"
SET "slug" = TRIM(BOTH '-' FROM REGEXP_REPLACE(
  LOWER(TRANSLATE("titulo", 'áàãâäéèêëíìîïóòõôöúùûüç', 'aaaaaeeeeiiiiooooouuuuc')),
  '[^a-z0-9]+', '-', 'g'
));

UPDATE "Filme"
SET "slug" = 'filme-' || LEFT("id", 8)
WHERE "slug" IS NULL OR "slug" = '';

WITH repetidos AS (
  SELECT "id", "slug", ROW_NUMBER() OVER (PARTITION BY "slug" ORDER BY "id") AS numero
  FROM "Filme"
)
UPDATE "Filme" AS filme
SET "slug" = repetidos."slug" || '-' || repetidos.numero
FROM repetidos
WHERE filme."id" = repetidos."id" AND repetidos.numero > 1;

ALTER TABLE "Filme" ALTER COLUMN "slug" SET NOT NULL;
CREATE UNIQUE INDEX "Filme_slug_key" ON "Filme"("slug");
