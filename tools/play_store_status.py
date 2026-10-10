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
    finally:
        edits.delete(packageName=args.package, editId=edit_id).execute()


if __name__ == "__main__":
    main()
