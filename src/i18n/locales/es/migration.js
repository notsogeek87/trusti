export default {
  steps: {
    choose: {
      title: "Elegir la alternativa",
      short: "Elección",
    },
    install: {
      title: "Instalar la nueva app",
      short: "Instalar",
    },
    transfer: {
      title: "Transferir tus datos",
      short: "Datos",
    },
    cleanup: {
      title: "Dejar la antigua app",
      short: "Limpiar",
    },
  },
  tips: {
    "0": {
      export: [
        "Exporta el historial de las conversaciones importantes (ajustes > chats).",
        "Apunta los grupos que tendrás que volver a crear.",
      ],
      import: [
        "Invita a tus contactos clave a la nueva app antes de dejar la antigua.",
        "Conserva la antigua app unos días para la transición.",
      ],
    },
    "1": {
      export: [
        "Exporta tus contactos (archivo .vcf o .csv).",
        "Guarda tus mensajes (archivo .mbox o sincronización IMAP).",
      ],
      import: [
        "Importa los contactos y los mensajes en el nuevo buzón.",
        "Activa un reenvío desde la antigua dirección y avisa a tus contactos.",
      ],
    },
    "2": {
      export: [
        "Exporta tus credenciales en CSV desde el antiguo gestor.",
        "No dejes nunca ese archivo por ahí: está sin cifrar.",
      ],
      import: [
        "Importa el CSV en el nuevo gestor y comprueba algunas cuentas.",
        "Borra el archivo CSV (y la papelera) en cuanto termines.",
      ],
    },
    "3": {
      export: [
        "Descarga todos tus archivos (exportación del archivo completo).",
        "Comprueba el tamaño del archivo antes de borrar nada.",
      ],
      import: [
        "Sube los archivos al nuevo servicio y comprueba el número de archivos.",
        "Actualiza los enlaces compartidos con tus allegados.",
      ],
    },
    "4": {
      export: [
        "Exporta tus notas (Markdown, HTML o formato propio).",
        "No olvides los adjuntos y las imágenes.",
      ],
      import: [
        "Importa el archivo en la nueva app y comprueba el formato.",
      ],
    },
    "5": {
      export: [
        "Descarga el archivo completo de tus fotos y vídeos.",
        "Conserva los metadatos (fechas, lugares) si es posible.",
      ],
      import: [
        "Importa las fotos en el nuevo servicio y comprueba los álbumes.",
      ],
    },
    "6": {
      export: [
        "Exporta tus listas de reproducción (herramienta de exportación de playlists o archivo M3U).",
      ],
      import: [
        "Importa las listas en la nueva app y vuelve a crear tus favoritos.",
      ],
    },
    "7": {
      export: [
        "Exporta tus marcadores (HTML) y, si hace falta, tus contraseñas guardadas.",
      ],
      import: [
        "Importa los marcadores en el nuevo navegador y elige el buscador predeterminado.",
      ],
    },
    "8": {
      export: [
        "Pide una copia de tus datos (fotos, publicaciones, contactos) en los ajustes de la cuenta.",
      ],
      import: [
        "Avisa a tus allegados de tu nueva cuenta y comparte tu nuevo nombre de usuario.",
      ],
    },
    "9": {
      export: [
        "Descarga tus extractos y certificados antes de cerrar nada.",
        "Apunta los recibos domiciliados que tendrás que cambiar.",
      ],
      import: [
        "Cambia las transferencias y los recibos periódicos antes de cerrar la antigua cuenta.",
      ],
    },
  },
  defaultTips: {
    export: [
      "Busca «Exportar mis datos» o «Descargar mis datos» en los ajustes de la app.",
      "Guarda lo que quieras conservar (archivos, contactos, historial).",
    ],
    import: [
      "Importa esos datos en la nueva app y comprueba que está todo.",
    ],
  },
  cleanup: [
    "Comprueba que todo está transferido antes de borrar la cuenta.",
    "Borra la cuenta en la app o en el sitio web (no solo la app) para eliminar tus datos en el editor.",
    "Desinstala la app y retira sus accesos (cuenta de Google, contactos, notificaciones).",
  ],
  modal: {
    attention: "Atención",
    goodToKnow: "Conviene saber",
    source: "Fuente: ayuda oficial",
    uninstallFailed: "No se puede abrir la desinstalación. Inténtalo desde los ajustes del teléfono.",
    title: "Migrar desde {name}",
    progress: "{completed}/{total} pasos hechos",
    close: "Cerrar",
    done: "¡Migración terminada!",
    doneBody: "{old} queda sustituida por {new} en «Mis Apps».",
    progressAria: "Progreso",
    stepAria: "Paso {n}: {title}",
    easy: "⭐ Migración fácil · ",
    recommended: "Recomendada · ",
    installBefore: "Instala",
    installAfter: "antes de tocar {name}.",
    officialSite: "Sitio oficial",
    detected: "✓ Detectada en tu teléfono",
    installedCheck: "He instalado {name}",
    loadingGuide: "Cargando la guía",
    exportTitle: "1. Recuperar tus datos de {name}",
    importTitle: "2. Pasarlos a {name}",
    transferredCheck: "Mis datos están transferidos",
    beforeLeaving: "Antes de irte",
    uninstall: "Desinstalar {name}",
    leftCheck: "He dejado {name}",
    uninstalledCheck: "{name} está desinstalada",
    finish: "Terminar la migración",
    next: "Hecho, paso siguiente",
  },
};
