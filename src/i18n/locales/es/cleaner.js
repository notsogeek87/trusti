export default {
  filters: {
    "incomplete-downloads": {
      label: "Descargas incompletas",
      description: "Archivos .crdownload, .part o .download que deja una descarga interrumpida.",
    },
    "temp-files": {
      label: "Archivos temporales",
      description: "Archivos .tmp y .temp de más de 7 días, sin contar los datos de las apps.",
    },
    "orphan-thumbnails": {
      label: "Miniaturas de la galería",
      description: "Caché de miniaturas (.thumbnails) que la galería regenera automáticamente.",
    },
    "whatsapp-statuses": {
      label: "Estados de WhatsApp en caché",
      description: "Estados de WhatsApp ya vistos (de más de 30 días) guardados en la caché de la app.",
    },
    "old-apks": {
      label: "APK antiguos descargados",
      description: "Archivos .apk, .apks y .xapk de la carpeta Descargas de más de 30 días.",
    },
    "ota-leftovers": {
      label: "Restos de actualizaciones del sistema",
      description: "Archivos de actualización (update.zip, ota…) de la carpeta Descargas de más de 30 días.",
    },
    "logs-and-reports": {
      label: "Registros e informes de errores",
      description: "Archivos .log, .trace y carpeta bugreports de más de 30 días, sin contar los datos de las apps.",
    },
    "empty-directories": {
      label: "Carpetas vacías",
      description: "Carpetas sin ningún contenido desde hace más de 30 días (sin contar los datos de las apps).",
    },
  },
  section: {
    scanFailed: "El análisis ha fallado.",
    freed_one: "{size} liberados ({count} elemento){ignored}.",
    freed_other: "{size} liberados ({count} elementos){ignored}.",
    ignored_one: ", {count} ignorado (modificado o protegido)",
    ignored_other: ", {count} ignorados (modificados o protegidos)",
    deleteFailed: "La eliminación ha fallado.",
    title: "Limpiar el almacenamiento",
    intro: "Localiza los archivos inútiles (descargas interrumpidas, temporales, miniaturas…). El análisis se hace solo en tu teléfono y no borra nada: luego eliges qué categorías limpiar.",
    checking: "Comprobando…",
    allowAccess: "Permitir el acceso a los archivos",
    analysing: "Analizando…",
    analyseAgain: "Volver a analizar",
    analyse: "Analizar",
    nothing: "Nada que limpiar",
    items_one: "{count} elemento · {size}",
    items_other: "{count} elementos · {size}",
    truncated: "El almacenamiento es muy grande: el análisis se ha limitado. Vuelve a lanzarlo después de una primera limpieza.",
    deleting: "Eliminando…",
    confirm: "Confirmar: eliminación definitiva",
    clean_one: "Limpiar {count} elemento ({size})",
    clean_other: "Limpiar {count} elementos ({size})",
  },
};
