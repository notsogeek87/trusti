export default {
  steps: {
    choose: {
      title: "Wybierz alternatywę",
      short: "Wybór",
    },
    install: {
      title: "Zainstaluj nową aplikację",
      short: "Instalacja",
    },
    transfer: {
      title: "Przenieś swoje dane",
      short: "Dane",
    },
    cleanup: {
      title: "Porzuć starą aplikację",
      short: "Porządki",
    },
  },
  tips: {
    "0": {
      export: [
        "Wyeksportuj historię ważnych rozmów (ustawienia > czaty).",
        "Zanotuj grupy, które trzeba będzie utworzyć od nowa.",
      ],
      import: [
        "Zaproś najważniejsze kontakty do nowej aplikacji, zanim porzucisz starą.",
        "Zachowaj starą aplikację przez kilka dni na okres przejściowy.",
      ],
    },
    "1": {
      export: [
        "Wyeksportuj kontakty (plik .vcf lub .csv).",
        "Zapisz wiadomości (archiwum .mbox lub synchronizacja IMAP).",
      ],
      import: [
        "Zaimportuj kontakty i wiadomości do nowej skrzynki.",
        "Włącz przekierowanie ze starego adresu i powiadom swoich korespondentów.",
      ],
    },
    "2": {
      export: [
        "Wyeksportuj dane logowania do pliku CSV ze starego menedżera.",
        "Nigdy nie zostawiaj tego pliku na wierzchu: jest niezaszyfrowany.",
      ],
      import: [
        "Zaimportuj plik CSV do nowego menedżera i sprawdź kilka kont.",
        "Usuń plik CSV (i opróżnij kosz), gdy tylko skończysz.",
      ],
    },
    "3": {
      export: [
        "Pobierz wszystkie pliki (eksport pełnego archiwum).",
        "Sprawdź rozmiar archiwum, zanim cokolwiek usuniesz.",
      ],
      import: [
        "Prześlij pliki do nowej usługi i sprawdź ich liczbę.",
        "Zaktualizuj linki udostępnione bliskim.",
      ],
    },
    "4": {
      export: [
        "Wyeksportuj notatki (Markdown, HTML lub własny format).",
        "Pamiętaj o załącznikach i obrazach.",
      ],
      import: [
        "Zaimportuj plik do nowej aplikacji i sprawdź formatowanie.",
      ],
    },
    "5": {
      export: [
        "Pobierz pełne archiwum zdjęć i filmów.",
        "W miarę możliwości zachowaj metadane (daty, miejsca).",
      ],
      import: [
        "Zaimportuj zdjęcia do nowej usługi i sprawdź albumy.",
      ],
    },
    "6": {
      export: [
        "Wyeksportuj playlisty (narzędzie do eksportu playlist lub plik M3U).",
      ],
      import: [
        "Zaimportuj playlisty do nowej aplikacji, a potem odtwórz ulubione.",
      ],
    },
    "7": {
      export: [
        "Wyeksportuj zakładki (HTML) i w razie potrzeby zapisane hasła.",
      ],
      import: [
        "Zaimportuj zakładki do nowej przeglądarki i ustaw domyślną wyszukiwarkę.",
      ],
    },
    "8": {
      export: [
        "Poproś o kopię swoich danych (zdjęcia, posty, kontakty) w ustawieniach konta.",
      ],
      import: [
        "Powiadom bliskich o nowym koncie i podaj swoją nową nazwę użytkownika.",
      ],
    },
    "9": {
      export: [
        "Pobierz wyciągi i zaświadczenia przed zamknięciem czegokolwiek.",
        "Zanotuj polecenia zapłaty do przeniesienia.",
      ],
      import: [
        "Przenieś stałe przelewy i polecenia zapłaty przed zamknięciem starego konta.",
      ],
    },
  },
  defaultTips: {
    export: [
      "Szukaj opcji „Eksportuj moje dane” lub „Pobierz moje dane” w ustawieniach aplikacji.",
      "Zapisz to, co chcesz zachować (pliki, kontakty, historię).",
    ],
    import: [
      "Zaimportuj te dane do nowej aplikacji i sprawdź, czy wszystko jest na miejscu.",
    ],
  },
  cleanup: [
    "Sprawdź, czy wszystko zostało przeniesione, zanim usuniesz konto.",
    "Usuń konto w aplikacji lub na stronie (nie tylko samą aplikację), aby wydawca skasował twoje dane.",
    "Odinstaluj aplikację, a potem cofnij jej dostępy (konto Google, kontakty, powiadomienia).",
  ],
  modal: {
    attention: "Uwaga",
    goodToKnow: "Warto wiedzieć",
    source: "Źródło: oficjalna pomoc",
    uninstallFailed: "Nie można otworzyć odinstalowania. Spróbuj w ustawieniach telefonu.",
    title: "Migracja z {name}",
    progress: "Wykonane kroki: {completed}/{total}",
    close: "Zamknij",
    done: "Migracja zakończona!",
    doneBody: "{old} została zastąpiona przez {new} w „Moich aplikacjach”.",
    progressAria: "Postęp",
    stepAria: "Krok {n}: {title}",
    easy: "⭐ Łatwa migracja · ",
    recommended: "Polecana · ",
    installBefore: "Zainstaluj",
    installAfter: "zanim ruszysz {name}.",
    officialSite: "Oficjalna strona",
    detected: "✓ Wykryta na twoim telefonie",
    installedCheck: "Zainstalowano {name}",
    loadingGuide: "Ładowanie przewodnika",
    exportTitle: "1. Pobierz swoje dane z {name}",
    importTitle: "2. Przenieś je do {name}",
    transferredCheck: "Moje dane są przeniesione",
    beforeLeaving: "Zanim odejdziesz",
    uninstall: "Odinstaluj {name}",
    leftCheck: "Porzucono {name}",
    uninstalledCheck: "{name} została odinstalowana",
    finish: "Zakończ migrację",
    next: "Gotowe, następny krok",
  },
};
