export default {
  managers: {
    bitwarden: {
      pitch: "De código abierto, sincronizado en todos tus dispositivos, gratis para lo esencial.",
    },
    keepassdx: {
      pitch: "100 % local, sin cuenta: tus contraseñas se quedan en un archivo que tú controlas.",
    },
    "proton-pass": {
      pitch: "Cifrado de extremo a extremo, editor suizo, integrado en el ecosistema Proton.",
    },
  },
  practices: {
    unique: {
      title: "Una contraseña distinta para cada cuenta",
      text: "Si hackean un sitio, los ladrones prueban la misma contraseña en otros. Una contraseña única limita los daños a una sola cuenta.",
    },
    long: {
      title: "Larga mejor que complicada",
      text: "Una frase de paso de 4 palabras al azar o más (o 16 caracteres o más) resiste mejor que una palabra corta llena de símbolos.",
    },
    manager: {
      title: "Un gestor mejor que tu memoria",
      text: "Un gestor genera y recuerda contraseñas únicas por ti. Solo tienes que recordar una contraseña maestra, larga y sólida.",
    },
    "2fa": {
      title: "Activa la verificación en dos pasos (2FA)",
      text: "Un código temporal además de la contraseña bloquea la mayoría de los ataques. Mejor una aplicación de autenticación que el SMS, y protege primero tu correo.",
    },
    passkeys: {
      title: "Usa las passkeys cuando sea posible",
      text: "Una passkey sustituye la contraseña por una clave guardada en tu dispositivo: imposible de robar con phishing o de reutilizar. Muchos gestores saben manejarlas.",
    },
    share: {
      title: "Nunca compartas una contraseña",
      text: "Ningún servicio serio te la pide por correo, SMS o teléfono. Si tienes dudas, entra por el sitio oficial.",
    },
  },
  checks: {
    manager: {
      label: "Uso un gestor de contraseñas",
    },
    "2fa-mail": {
      label: "La verificación en dos pasos está activa en mi correo",
    },
    "screen-lock": {
      label: "Mi pantalla está bloqueada (código, huella o cara)",
    },
    backup: {
      label: "Mis datos importantes tienen copia de seguridad",
    },
    updates: {
      label: "Mi teléfono y mis apps están actualizados",
    },
  },
  modal: {
    close: "Cerrar",
    eyebrow: "Higiene digital",
    title: "Proteger tus cuentas en el día a día",
    intro: "Una buena nota de confianza no basta: la forma en que proteges tus accesos cuenta igual. Bastan unos pocos reflejos.",
    myScore: "Mi balance · {done}/{total}",
    detectedInApps: "Detectado en tus apps",
    habits: "Los buenos reflejos",
    managers: "Gestores recomendados",
    ecosystem: "Usas {name}, ligado a un ecosistema. Un gestor independiente te permite cambiar de teléfono o de navegador sin perderlo todo.",
    footer: "Enlaces oficiales (Play Store), sin afiliación. Todo lo que marques aquí se queda en tu dispositivo.",
  },
};
