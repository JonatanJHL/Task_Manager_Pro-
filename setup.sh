#!/usr/bin/env bash
set -e

if ! command -v docker &> /dev/null; then
  echo "❌ No se encontró Docker. Instala Docker Desktop y vuelve a correr este script."
  exit 1
fi

if [ ! -f .env ]; then
  cp .env.example .env
  if command -v openssl &> /dev/null; then
    GENERATED_SECRET=$(openssl rand -base64 32)
    tmp=$(mktemp)
    sed "s#tu_clave_secreta_muy_larga#${GENERATED_SECRET}#" .env > "$tmp" && mv "$tmp" .env
    echo "✅ .env creado con JWT_SECRET generado automáticamente."
  else
    echo "⚠️  .env creado, pero no se encontró 'openssl'. Edita JWT_SECRET a mano en .env antes de continuar."
  fi
  echo "👉 Revisa DB_PASSWORD en .env antes de seguir (o déjalo, solo lo usa el contenedor de la base de datos)."
else
  echo "ℹ️  Ya existe un .env, no se sobreescribe."
fi

echo "🚀 Levantando Task Manager Pro..."
docker compose up -d --build

echo ""
echo "✅ Listo. Abre http://localhost:8080 en esta máquina."
echo "   Para que tu equipo entre desde otras computadoras de la misma red,"
echo "   comparte con ellos: http://<IP-de-esta-máquina>:8080"
