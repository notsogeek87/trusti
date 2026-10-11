#!/usr/bin/env python3
"""Affiche l'état des canaux Google Play d'une app (lecture seule).

    PLAY_STORE_SERVICE_ACCOUNT_JSON='...' python3 tools/play_store_status.py --package eu.trusti.app

Ouvre une édition, liste les canaux et leurs releases (statut, versionCodes), puis
supprime l'édition sans rien commiter.
"""
import argparse
import json
import os
import sys

from google.oauth2 import service_account
from googleapiclient.discovery import build

SCOPES = ["https://www.googleapis.com/auth/androidpublisher"]


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--package", required=True)
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
    try:
        tracks = edits.tracks().list(packageName=args.package, editId=edit_id).execute()
        for t in tracks.get("tracks", []):
            print(f"Canal « {t['track']} »")
            for r in t.get("releases", []):
                print(
                    f"  - statut={r.get('status')} name={r.get('name')} "
                    f"versionCodes={r.get('versionCodes')}"
                )
            if not t.get("releases"):
                print("  (aucune release)")
        diagnostic(api, edits, args.package, edit_id)
    finally:
        edits.delete(packageName=args.package, editId=edit_id).execute()


def essaie(titre, fn):
    """Affiche le résultat d'un appel de diagnostic ; une erreur ne coupe pas le reste."""
    print(f"\n== {titre}")
    try:
        print(json.dumps(fn(), indent=2, ensure_ascii=False, default=str))
    except Exception as e:  # noqa: BLE001 - diagnostic en lecture seule
        print(f"  (indisponible : {type(e).__name__}: {str(e)[:300]})")


def diagnostic(api, edits, package, edit_id):
    """Détails utiles pour comprendre pourquoi une release n'arrive pas aux testeurs."""
    e = {"packageName": package, "editId": edit_id}
    for track in ("alpha", "internal"):
        essaie(f"Canal {track} (JSON complet)", lambda t=track: edits.tracks().get(track=t, **e).execute())
        essaie(f"Testeurs du canal {track}", lambda t=track: edits.testers().get(track=t, **e).execute())
        essaie(
            f"Disponibilité par pays du canal {track}",
            lambda t=track: edits.countryavailability().get(track=t, **e).execute(),
        )
    essaie("Bundles uploadés", lambda: edits.bundles().list(**e).execute())
    essaie("Détails de l'app", lambda: edits.details().get(**e).execute())
    essaie(
        "Fiches Play Store (langues renseignées)",
        lambda: [
            {k: (v if k in ("language", "title") else f"{len(v)} car.") for k, v in l.items()}
            for l in edits.listings().list(**e).execute().get("listings", [])
        ],
    )


if __name__ == "__main__":
    main()
