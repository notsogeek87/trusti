#!/usr/bin/env python3
"""Publie un .aab sur un canal de test Google Play, via l'API Play Developer.

    PLAY_STORE_SERVICE_ACCOUNT_JSON='...' python3 tools/publish_play_store.py \
        --package eu.trusti.app --aab trusti-1.0.5.aab --track internal

Repris de swipernews (voir son tools/publish_play_store.py), qui remplace
l'action GitHub r0adkll/upload-google-play : elle ne permet pas de lister les
tracks réels de l'app, ce qui avait coûté plusieurs itérations là-bas avant de
trouver qu'un nom de canal supposé ("alpha") ne correspondait à aucun canal
réel — Play Console nomme parfois son premier canal de tests fermés d'après
le nom de l'app plutôt que le nom historique Google. "internal" (le canal
de tests internes, toujours créé par défaut par Play Console, jusqu'à 100
testeurs sans revue) est le point de départ le plus sûr pour Trusti tant
qu'aucun canal de tests fermés dédié n'a été créé à la main dans la Console —
à ajuster avec --track une fois un canal choisi.

Dépendances (installées à la volée par le workflow, pas dans package.json —
ce script ne s'exécute que dans ce job CI, jamais dans l'app ni les tests) :
google-api-python-client, google-auth.
"""
import argparse
import json
import os
import sys
from pathlib import Path

from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

SCOPES = ["https://www.googleapis.com/auth/androidpublisher"]

# Notes de version (« Nouveautés » de la fiche Play Store) : un fichier par
# langue, nommé d'après le code Play (fr-FR.txt...). Limite Google : 500
# caractères par langue (vérifiée aussi par tests/technical/playStoreReleaseNotes.test.js).
NOTES_DIR = Path(__file__).resolve().parent.parent / "play-store" / "notes-de-version"
NOTES_MAX = 500


def read_release_notes(notes_dir=NOTES_DIR):
    notes = []
    if not notes_dir.is_dir():
        return notes
    for path in sorted(notes_dir.glob("*.txt")):
        text = path.read_text(encoding="utf-8").strip()
        if not text:
            continue
        if len(text) > NOTES_MAX:
            sys.exit(f"{path.name} : {len(text)} caractères, Google en accepte {NOTES_MAX} au maximum.")
        notes.append({"language": path.stem, "text": text})
    return notes


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--package", required=True)
    p.add_argument("--aab", required=True)
    p.add_argument("--track", required=True)
    p.add_argument("--status", default="completed")
    p.add_argument(
        "--fraction",
        type=float,
        default=1.0,
        help="Part des utilisateurs, production uniquement : 1 = 100 %% (release complète, "
        "défaut), entre 0 et 1 exclu = déploiement progressif",
    )
    p.add_argument(
        "--countries",
        default="FR",
        help="Pays de diffusion (codes ISO séparés par des virgules), production uniquement",
    )
    args = p.parse_args()

    creds_json = os.environ.get("PLAY_STORE_SERVICE_ACCOUNT_JSON")
    if not creds_json:
        sys.exit("PLAY_STORE_SERVICE_ACCOUNT_JSON manquant dans l'environnement.")
    creds = service_account.Credentials.from_service_account_info(
        json.loads(creds_json), scopes=SCOPES
    )
    api = build("androidpublisher", "v3", credentials=creds, cache_discovery=False)
    edits = api.edits()

    edit_id = edits.insert(body={}, packageName=args.package).execute()["id"]

    # Vérification bon marché avant d'aller plus loin : un nom de track faux
    # échouerait sinon seulement au commit, après l'upload complet du bundle.
    tracks = edits.tracks().list(packageName=args.package, editId=edit_id).execute()
    known = [t["track"] for t in tracks.get("tracks", [])]
    if args.track not in known:
        sys.exit(f"Track « {args.track} » introuvable. Tracks connus : {known}")

    # mimetype explicite : la détection automatique de MediaFileUpload se base
    # sur le module mimetypes de Python, qui ne connaît pas .aab (contrairement
    # à .zip dont c'est pourtant le format sous-jacent) — sans ça, l'upload
    # échoue avec UnknownFileType avant même de contacter l'API.
    media = MediaFileUpload(args.aab, mimetype="application/octet-stream")
    bundle = edits.bundles().upload(
        editId=edit_id, packageName=args.package, media_body=media
    ).execute()
    version_code = str(bundle["versionCode"])
    print(f"Bundle uploadé : versionCode {version_code}")

    release = {"versionCodes": [version_code], "status": args.status}
    # Seules les langues présentes dans la fiche Play Store sont envoyées :
    # l'API refuse une note dans une langue que la fiche ne déclare pas.
    notes = read_release_notes()
    if notes:
        listed = {
            l["language"]
            for l in edits.listings().list(packageName=args.package, editId=edit_id).execute().get("listings", [])
        }
        skipped = [n["language"] for n in notes if n["language"] not in listed]
        if skipped:
            print(f"::warning::Notes ignorées (langue absente de la fiche : {skipped}). Langues de la fiche : {sorted(listed)}")
        notes = [n for n in notes if n["language"] in listed]
    if notes:
        release["releaseNotes"] = notes
        for n in notes:
            print(f"Notes de version [{n['language']}] :\n{n['text']}")
    else:
        print("::warning::Aucune note de version envoyée (play-store/notes-de-version/).")
    # countryTargeting : obligatoire en production (« Release in track
    # targeting no countries » sinon), mais invalide hors production quel que
    # soit le status (confirmé par l'API elle-même en le testant). En
    # production l'API ne l'accepte que pour un déploiement progressif
    # (« Country targeting is only supported for staged releases »).
    # Si les pays demandés couvrent déjà tous les pays du canal (configurés dans
    # la Play Console), l'API exige au contraire d'omettre countryTargeting
    # (« To target all countries in staged rollout omit country targeting »).
    if args.track == "production":
        if not 0 < args.fraction <= 1:
            sys.exit(f"--fraction doit être dans ]0, 1] (reçu {args.fraction}).")
        staged = args.fraction < 1
        if staged:
            release["status"] = "inProgress"
            release["userFraction"] = args.fraction
        else:
            release["status"] = "completed"
        countries = [c.strip().upper() for c in args.countries.split(",") if c.strip()]
        availability = edits.countryavailability().get(
            packageName=args.package, editId=edit_id, track=args.track
        ).execute()
        available = {c["countryCode"].upper() for c in availability.get("countries", [])}
        rest_of_world = bool(availability.get("restOfWorld"))
        if not available and not rest_of_world:
            sys.exit(
                "Aucun pays configuré pour la production dans la Play Console "
                "(Production > Pays/régions) : en ajouter au moins un."
            )
        if rest_of_world or not available.issubset(countries):
            # Ciblage de pays réservé aux déploiements progressifs : une release
            # à 100 % touche forcément tous les pays du canal.
            if not staged:
                sys.exit(
                    f"Release à 100 % impossible avec un ciblage {countries} : le canal couvre "
                    f"{sorted(available)}{' + reste du monde' if rest_of_world else ''}. "
                    "Ajuster les pays dans la Play Console ou passer --fraction < 1."
                )
            release["countryTargeting"] = {"countries": countries, "includeRestOfWorld": False}
        print(
            f"Pays du canal : {sorted(available)}{' + reste du monde' if rest_of_world else ''} ; "
            f"ciblage : {'tous' if 'countryTargeting' not in release else countries}"
        )
    edits.tracks().update(
        editId=edit_id,
        packageName=args.package,
        track=args.track,
        body={"releases": [release]},
    ).execute()

    edits.commit(editId=edit_id, packageName=args.package).execute()
    rollout = f" ({release['userFraction']:.0%} des utilisateurs)" if "userFraction" in release else ""
    print(f"Publié sur le canal « {args.track} » : versionCode {version_code}{rollout}")


if __name__ == "__main__":
    main()
