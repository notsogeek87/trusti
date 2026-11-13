#!/bin/sh
# Copie le logo Hyperfluid dans public/hosting/ pour la mention d'hébergement
# (src/components/ui/HostingCredit.jsx). Utilisé par les builds Hyperfluid et Android.
# En cas d'échec, la mention s'affiche simplement sans logo.
mkdir -p public/hosting
if curl -fsSL --max-time 30 https://www.hyperfluid.cloud/images/hyperfluid-icon.svg -o public/hosting/hyperfluid.svg \
   && grep -q "<svg" public/hosting/hyperfluid.svg; then
  echo "Logo Hyperfluid copié"
else
  echo "Logo indisponible : la mention s'affichera sans logo"
  rm -f public/hosting/hyperfluid.svg
fi
