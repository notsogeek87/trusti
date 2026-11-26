export default {
  managers: {
    bitwarden: {
      pitch: "Código aberto, sincronizado em todos os teus dispositivos, gratuito no essencial.",
    },
    keepassdx: {
      pitch: "100% local, sem conta: as tuas palavras-passe ficam num ficheiro que tu controlas.",
    },
    "proton-pass": {
      pitch: "Encriptado ponto a ponto, editor suíço, integrado no ecossistema Proton.",
    },
  },
  practices: {
    unique: {
      title: "Uma palavra-passe diferente para cada conta",
      text: "Se um site for pirateado, os ladrões experimentam a mesma palavra-passe noutros sítios. Uma palavra-passe única limita os danos a uma só conta.",
    },
    long: {
      title: "Longa em vez de complicada",
      text: "Uma frase-passe de 4 ou mais palavras ao acaso (ou 16 caracteres ou mais) resiste melhor do que uma palavra curta cheia de símbolos.",
    },
    manager: {
      title: "Um gestor em vez da tua memória",
      text: "Um gestor gera e memoriza palavras-passe únicas por ti. Só tens de te lembrar de uma palavra-passe mestra, longa e robusta.",
    },
    "2fa": {
      title: "Ativa a autenticação de dois fatores (2FA)",
      text: "Um código temporário além da palavra-passe bloqueia a maioria dos ataques. Prefere uma aplicação de autenticação ao SMS e protege primeiro o teu e-mail.",
    },
    passkeys: {
      title: "Adota as passkeys sempre que possível",
      text: "Uma passkey substitui a palavra-passe por uma chave guardada no teu dispositivo: impossível de roubar por phishing ou de reutilizar. Muitos gestores sabem geri-las.",
    },
    share: {
      title: "Nunca partilhes uma palavra-passe",
      text: "Nenhum serviço sério ta pede por e-mail, SMS ou telefone. Em caso de dúvida, vai pelo site oficial.",
    },
  },
  checks: {
    manager: {
      label: "Uso um gestor de palavras-passe",
    },
    "2fa-mail": {
      label: "A autenticação de dois fatores está ativa no meu e-mail",
    },
    "screen-lock": {
      label: "O meu ecrã está bloqueado (código, impressão digital ou rosto)",
    },
    backup: {
      label: "Os meus dados importantes têm cópia de segurança",
    },
    updates: {
      label: "O meu telemóvel e as minhas apps estão atualizados",
    },
  },
  modal: {
    close: "Fechar",
    eyebrow: "Higiene digital",
    title: "Proteger as tuas contas no dia a dia",
    intro: "Uma boa nota de confiança não chega: a forma como proteges os teus acessos conta tanto quanto ela. Bastam alguns bons hábitos.",
    myScore: "O meu balanço · {done}/{total}",
    detectedInApps: "Detetado nas tuas apps",
    habits: "Os bons hábitos",
    managers: "Gestores recomendados",
    ecosystem: "Usas {name}, ligado a um ecossistema. Um gestor independente permite-te mudar de telemóvel ou de navegador sem perder tudo.",
    footer: "Ligações oficiais (Play Store), sem afiliação. Tudo o que assinalares aqui fica no teu dispositivo.",
  },
};
