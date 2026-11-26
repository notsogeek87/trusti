export default {
  managers: {
    bitwarden: {
      pitch: "Open source, synchronizowany na wszystkich twoich urządzeniach, w podstawowej wersji darmowy.",
    },
    keepassdx: {
      pitch: "W 100% lokalny, bez konta: twoje hasła zostają w pliku, nad którym masz kontrolę.",
    },
    "proton-pass": {
      pitch: "Szyfrowanie end-to-end, szwajcarski wydawca, zintegrowany z ekosystemem Proton.",
    },
  },
  practices: {
    unique: {
      title: "Inne hasło do każdego konta",
      text: "Gdy jakaś strona zostanie zhakowana, złodzieje próbują tego samego hasła gdzie indziej. Unikalne hasło ogranicza szkody do jednego konta.",
    },
    long: {
      title: "Lepiej długie niż skomplikowane",
      text: "Fraza z co najmniej 4 losowych słów (lub 16 i więcej znaków) jest odporniejsza niż krótkie słowo pełne symboli.",
    },
    manager: {
      title: "Menedżer zamiast pamięci",
      text: "Menedżer tworzy i zapamiętuje unikalne hasła za ciebie. Musisz pamiętać tylko jedno hasło główne, długie i mocne.",
    },
    "2fa": {
      title: "Włącz uwierzytelnianie dwuskładnikowe (2FA)",
      text: "Jednorazowy kod oprócz hasła blokuje większość włamań. Wybieraj aplikację uwierzytelniającą zamiast SMS-ów i najpierw zabezpiecz pocztę.",
    },
    passkeys: {
      title: "Korzystaj z kluczy dostępu, gdy to możliwe",
      text: "Klucz dostępu (passkey) zastępuje hasło kluczem zapisanym na twoim urządzeniu: nie da się go wyłudzić phishingiem ani użyć ponownie. Wiele menedżerów je obsługuje.",
    },
    share: {
      title: "Nigdy nie podawaj nikomu hasła",
      text: "Żadna poważna usługa nie prosi o nie e-mailem, SMS-em ani telefonicznie. W razie wątpliwości wejdź przez oficjalną stronę.",
    },
  },
  checks: {
    manager: {
      label: "Używam menedżera haseł",
    },
    "2fa-mail": {
      label: "Uwierzytelnianie dwuskładnikowe jest włączone na mojej poczcie",
    },
    "screen-lock": {
      label: "Mój ekran jest zablokowany (kod, odcisk palca lub twarz)",
    },
    backup: {
      label: "Moje ważne dane mają kopię zapasową",
    },
    updates: {
      label: "Mój telefon i aplikacje są aktualne",
    },
  },
  modal: {
    close: "Zamknij",
    eyebrow: "Higiena cyfrowa",
    title: "Codzienna ochrona twoich kont",
    intro: "Dobra ocena zaufania to nie wszystko: równie ważne jest to, jak chronisz swoje dostępy. Wystarczy kilka nawyków.",
    myScore: "Mój bilans · {done}/{total}",
    detectedInApps: "Wykryto w twoich aplikacjach",
    habits: "Dobre nawyki",
    managers: "Polecane menedżery",
    ecosystem: "Używasz {name}, powiązanego z ekosystemem. Niezależny menedżer pozwala zmienić telefon lub przeglądarkę bez utraty wszystkiego.",
    footer: "Oficjalne linki (Play Store), bez afiliacji. Wszystko, co tu zaznaczysz, zostaje na twoim urządzeniu.",
  },
};
