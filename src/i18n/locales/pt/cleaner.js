export default {
  filters: {
    "incomplete-downloads": {
      label: "Transferências incompletas",
      description: "Ficheiros .crdownload, .part ou .download deixados por uma transferência interrompida.",
    },
    "temp-files": {
      label: "Ficheiros temporários",
      description: "Ficheiros .tmp e .temp com mais de 7 dias, exceto dados das apps.",
    },
    "orphan-thumbnails": {
      label: "Miniaturas da galeria",
      description: "Cache de miniaturas (.thumbnails) regenerada automaticamente pela galeria.",
    },
    "whatsapp-statuses": {
      label: "Estados do WhatsApp em cache",
      description: "Estados do WhatsApp já vistos (com mais de 30 dias) guardados na cache da app.",
    },
    "old-apks": {
      label: "APK antigos transferidos",
      description: "Ficheiros .apk, .apks e .xapk da pasta Transferências com mais de 30 dias.",
    },
    "ota-leftovers": {
      label: "Restos de atualizações do sistema",
      description: "Arquivos de atualização (update.zip, ota…) da pasta Transferências com mais de 30 dias.",
    },
    "logs-and-reports": {
      label: "Registos e relatórios de erros",
      description: "Ficheiros .log, .trace e pasta bugreports com mais de 30 dias, exceto dados das apps.",
    },
    "empty-directories": {
      label: "Pastas vazias",
      description: "Pastas sem qualquer conteúdo há mais de 30 dias (exceto dados das apps).",
    },
  },
  section: {
    scanFailed: "A análise falhou.",
    freed_one: "{size} libertados ({count} elemento){ignored}.",
    freed_other: "{size} libertados ({count} elementos){ignored}.",
    ignored_one: ", {count} ignorado (modificado ou protegido)",
    ignored_other: ", {count} ignorados (modificados ou protegidos)",
    deleteFailed: "A eliminação falhou.",
    title: "Limpar o armazenamento",
    intro: "Encontra os ficheiros inúteis (transferências interrompidas, temporários, miniaturas…). A análise é feita apenas no teu telemóvel e não apaga nada: depois escolhes as categorias a limpar.",
    checking: "A verificar…",
    allowAccess: "Autorizar o acesso aos ficheiros",
    analysing: "A analisar…",
    analyseAgain: "Analisar de novo",
    analyse: "Analisar",
    nothing: "Nada para limpar",
    items_one: "{count} elemento · {size}",
    items_other: "{count} elementos · {size}",
    truncated: "O armazenamento é muito grande: a análise foi limitada. Volta a lançá-la depois de uma primeira limpeza.",
    deleting: "A eliminar…",
    confirm: "Confirmar: eliminação definitiva",
    clean_one: "Limpar {count} elemento ({size})",
    clean_other: "Limpar {count} elementos ({size})",
  },
};
