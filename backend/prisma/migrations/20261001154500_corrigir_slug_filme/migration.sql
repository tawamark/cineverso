UPDATE "Filme" SET "slug" = 'temporario-' || "id";

WITH slugs_base AS (
  SELECT
    "id",
    COALESCE(
      NULLIF(
        TRIM(BOTH '-' FROM REGEXP_REPLACE(
          LOWER(TRANSLATE("titulo", 'áàãâäéèêëíìîïóòõôöúùûüç', 'aaaaaeeeeiiiiooooouuuuc')),
          '[^a-z0-9]+', '-', 'g'
        )),
        ''
      ),
      'filme'
    ) AS base
  FROM "Filme"
), numerados AS (
  SELECT "id", base, ROW_NUMBER() OVER (PARTITION BY base ORDER BY "id") AS numero
  FROM slugs_base
)
UPDATE "Filme" AS filme
SET "slug" = CASE
  WHEN numerados.numero = 1 THEN numerados.base
  ELSE numerados.base || '-' || numerados.numero
END
FROM numerados
WHERE filme."id" = numerados."id";
