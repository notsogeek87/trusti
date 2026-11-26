export default {
  steps: {
    choose: {
      title: "Escolher a alternativa",
      short: "Escolha",
    },
    install: {
      title: "Instalar a nova app",
      short: "Instalar",
    },
    transfer: {
      title: "Transferir os teus dados",
      short: "Dados",
    },
    cleanup: {
      title: "Deixar a antiga app",
      short: "Limpar",
    },
  },
  tips: {
    "0": {
      export: [
        "Exporta o histórico das conversas importantes (definições > conversas).",
        "Anota os grupos a recriar.",
      ],
      import: [
        "Convida os teus contactos principais para a nova app antes de deixares a antiga.",
        "Mantém a antiga app durante alguns dias para a transição.",
      ],
    },
    "1": {
      export: [
        "Exporta os teus contactos (ficheiro .vcf ou .csv).",
        "Guarda as tuas mensagens (arquivo .mbox ou sincronização IMAP).",
      ],
      import: [
        "Importa os contactos e as mensagens para a nova caixa.",
        "Ativa um reencaminhamento a partir do endereço antigo e avisa os teus correspondentes.",
      ],
    },
    "2": {
      export: [
        "Exporta as tuas credenciais em CSV a partir do gestor antigo.",
        "Nunca deixes este ficheiro à solta: não está encriptado.",
      ],
      import: [
        "Importa o CSV para o novo gestor e verifica algumas contas.",
        "Apaga o ficheiro CSV (e a reciclagem) logo que terminares.",
      ],
    },
    "3": {
      export: [
        "Transfere todos os teus ficheiros (exportação do arquivo completo).",
        "Verifica o tamanho do arquivo antes de apagar o que quer que seja.",
      ],
      import: [
        "Carrega os ficheiros no novo serviço e confirma o número de ficheiros.",
        "Atualiza as ligações partilhadas com as pessoas próximas.",
      ],
    },
    "4": {
      export: [
        "Exporta as tuas notas (Markdown, HTML ou formato próprio).",
        "Não te esqueças dos anexos e das imagens.",
      ],
      import: [
        "Importa o ficheiro para a nova app e verifica a formatação.",
      ],
    },
    "5": {
      export: [
        "Transfere o arquivo completo das tuas fotos e vídeos.",
        "Mantém os metadados (datas, locais), se possível.",
      ],
      import: [
        "Importa as fotos para o novo serviço e verifica os álbuns.",
      ],
    },
    "6": {
      export: [
        "Exporta as tuas playlists (ferramenta de exportação de playlists ou ficheiro M3U).",
      ],
      import: [
        "Importa as playlists para a nova app e recria os teus favoritos.",
      ],
    },
    "7": {
      export: [
        "Exporta os teus marcadores (HTML) e, se necessário, as palavras-passe guardadas.",
      ],
      import: [
        "Importa os marcadores para o novo navegador e define o motor de pesquisa predefinido.",
      ],
    },
    "8": {
      export: [
        "Pede uma cópia dos teus dados (fotos, publicações, contactos) nas definições da conta.",
      ],
      import: [
        "Avisa as pessoas próximas da tua nova conta e partilha o teu novo nome de utilizador.",
      ],
    },
    "9": {
      export: [
        "Transfere os teus extratos e declarações antes de encerrar o que quer que seja.",
        "Anota os débitos diretos a redirecionar.",
      ],
      import: [
        "Redireciona as transferências e os débitos diretos recorrentes antes de fechar a conta antiga.",
      ],
    },
  },
  defaultTips: {
    export: [
      "Procura «Exportar os meus dados» ou «Transferir os meus dados» nas definições da app.",
      "Guarda o que queres manter (ficheiros, contactos, histórico).",
    ],
    import: [
      "Importa estes dados para a nova app e verifica se está tudo lá.",
    ],
  },
  cleanup: [
    "Verifica que está tudo transferido antes de apagar a conta.",
    "Apaga a conta na app ou no site (não apenas a app) para eliminar os teus dados no editor.",
    "Desinstala a app e retira-lhe os acessos (conta Google, contactos, notificações).",
  ],
  modal: {
    attention: "Atenção",
    goodToKnow: "Bom saber",
    source: "Fonte: ajuda oficial",
    uninstallFailed: "Não foi possível abrir a desinstalação. Tenta a partir das definições do telemóvel.",
    title: "Migrar a partir de {name}",
    progress: "{completed}/{total} passos feitos",
    close: "Fechar",
    done: "Migração concluída!",
    doneBody: "{old} foi substituída por {new} em «As minhas apps».",
    progressAria: "Progresso",
    stepAria: "Passo {n}: {title}",
    easy: "⭐ Migração fácil · ",
    recommended: "Recomendada · ",
    installBefore: "Instala",
    installAfter: "antes de mexeres em {name}.",
    officialSite: "Site oficial",
    detected: "✓ Detetada no teu telemóvel",
    installedCheck: "Instalei {name}",
    loadingGuide: "A carregar o guia",
    exportTitle: "1. Recuperar os teus dados de {name}",
    importTitle: "2. Colocá-los em {name}",
    transferredCheck: "Os meus dados estão transferidos",
    beforeLeaving: "Antes de saíres",
    uninstall: "Desinstalar {name}",
    leftCheck: "Deixei {name}",
    uninstalledCheck: "{name} está desinstalada",
    finish: "Concluir a migração",
    next: "Feito, passo seguinte",
  },
};
