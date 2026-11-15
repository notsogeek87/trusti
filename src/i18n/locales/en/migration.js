export default {
  steps: {
    choose: {
      title: "Choose the alternative",
      short: "Choice",
    },
    install: {
      title: "Install the new app",
      short: "Install",
    },
    transfer: {
      title: "Transfer your data",
      short: "Data",
    },
    cleanup: {
      title: "Leave the old app",
      short: "Clean up",
    },
  },
  tips: {
    "0": {
      export: [
        "Export the history of important conversations (settings > chats).",
        "Note down the groups to recreate.",
      ],
      import: [
        "Invite your key contacts to the new app before leaving the old one.",
        "Keep the old app for a few days during the transition.",
      ],
    },
    "1": {
      export: [
        "Export your contacts (.vcf or .csv file).",
        "Back up your messages (.mbox archive or IMAP sync).",
      ],
      import: [
        "Import your contacts and messages into the new mailbox.",
        "Set up forwarding from the old address and let your contacts know.",
      ],
    },
    "2": {
      export: [
        "Export your logins as CSV from the old manager.",
        "Never leave this file lying around: it is unencrypted.",
      ],
      import: [
        "Import the CSV into the new manager, then check a few accounts.",
        "Delete the CSV file (and empty the bin) as soon as you are done.",
      ],
    },
    "3": {
      export: [
        "Download all your files (full archive export).",
        "Check the size of the archive before deleting anything.",
      ],
      import: [
        "Upload the files to the new service and check the number of files.",
        "Update the links you shared with friends and family.",
      ],
    },
    "4": {
      export: [
        "Export your notes (Markdown, HTML or a dedicated format).",
        "Remember attachments and images.",
      ],
      import: [
        "Import the file into the new app and check the formatting.",
      ],
    },
    "5": {
      export: [
        "Download the full archive of your photos and videos.",
        "Keep the metadata (dates, places) if possible.",
      ],
      import: [
        "Import the photos into the new service and check the albums.",
      ],
    },
    "6": {
      export: [
        "Export your playlists (playlist export tool or M3U file).",
      ],
      import: [
        "Import the playlists into the new app, then recreate your favourites.",
      ],
    },
    "7": {
      export: [
        "Export your bookmarks (HTML) and, if needed, your saved passwords.",
      ],
      import: [
        "Import the bookmarks into the new browser and set the default search engine.",
      ],
    },
    "8": {
      export: [
        "Request a copy of your data (photos, posts, contacts) in your account settings.",
      ],
      import: [
        "Let your friends know about your new account and share your new username.",
      ],
    },
    "9": {
      export: [
        "Download your statements and certificates before closing anything.",
        "Note down the direct debits to redirect.",
      ],
      import: [
        "Redirect recurring transfers and direct debits before closing the old account.",
      ],
    },
  },
  defaultTips: {
    export: [
      "Look for \"Export my data\" or \"Download my data\" in the app settings.",
      "Back up what you want to keep (files, contacts, history).",
    ],
    import: [
      "Import this data into the new app and check that everything is there.",
    ],
  },
  cleanup: [
    "Check that everything has been transferred before deleting the account.",
    "Delete the account in the app or on the website (not just the app) to erase your data held by the provider.",
    "Uninstall the app, then remove its access (Google account, contacts, notifications).",
  ],
  modal: {
    attention: "Warning",
    goodToKnow: "Good to know",
    source: "Source: official help",
    uninstallFailed: "Couldn't open uninstall. Try again from your phone's settings.",
    title: "Switch from {name}",
    progress: "{completed}/{total} steps done",
    close: "Close",
    done: "Switch complete!",
    doneBody: "{old} is now replaced by {new} in \"My apps\".",
    progressAria: "Progress",
    stepAria: "Step {n}: {title}",
    easy: "⭐ Easy switch · ",
    recommended: "Recommended · ",
    installBefore: "Install",
    installAfter: "before touching {name}.",
    officialSite: "Official website",
    detected: "✓ Detected on your phone",
    installedCheck: "I have installed {name}",
    loadingGuide: "Loading the guide",
    exportTitle: "1. Get your data out of {name}",
    importTitle: "2. Put them into {name}",
    transferredCheck: "My data has been transferred",
    beforeLeaving: "Before you leave",
    uninstall: "Uninstall {name}",
    leftCheck: "I have left {name}",
    uninstalledCheck: "{name} is uninstalled",
    finish: "Finish the switch",
    next: "Done, next step",
  },
};
