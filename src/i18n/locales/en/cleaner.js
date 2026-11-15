export default {
  filters: {
    "incomplete-downloads": {
      label: "Incomplete downloads",
      description: ".crdownload, .part or .download files left behind by an interrupted download.",
    },
    "temp-files": {
      label: "Temporary files",
      description: ".tmp and .temp files older than 7 days, excluding app data.",
    },
    "orphan-thumbnails": {
      label: "Gallery thumbnails",
      description: "Thumbnail cache (.thumbnails) that the gallery rebuilds automatically.",
    },
    "whatsapp-statuses": {
      label: "Cached WhatsApp statuses",
      description: "WhatsApp statuses already viewed (older than 30 days) kept in the app's cache.",
    },
    "old-apks": {
      label: "Old downloaded APKs",
      description: ".apk, .apks and .xapk files in the Downloads folder older than 30 days.",
    },
    "ota-leftovers": {
      label: "System update leftovers",
      description: "Update archives (update.zip, ota…) in the Downloads folder older than 30 days.",
    },
    "logs-and-reports": {
      label: "Logs and bug reports",
      description: ".log and .trace files and the bugreports folder older than 30 days, excluding app data.",
    },
    "empty-directories": {
      label: "Empty folders",
      description: "Folders with no content for more than 30 days (excluding app data).",
    },
  },
  section: {
    scanFailed: "The analysis failed.",
    freed_one: "{size} freed ({count} item){ignored}.",
    freed_other: "{size} freed ({count} items){ignored}.",
    ignored_one: ", {count} skipped (modified or protected)",
    ignored_other: ", {count} skipped (modified or protected)",
    deleteFailed: "Deletion failed.",
    title: "Clean up storage",
    intro: "Finds useless files (interrupted downloads, temporary files, thumbnails…). The analysis runs only on your phone and deletes nothing: you then choose which categories to clean.",
    checking: "Checking…",
    allowAccess: "Allow file access",
    analysing: "Analysing…",
    analyseAgain: "Analyse again",
    analyse: "Analyse",
    nothing: "Nothing to clean",
    items_one: "{count} item · {size}",
    items_other: "{count} items · {size}",
    truncated: "Storage is very large: the analysis was limited. Run it again after a first clean-up.",
    deleting: "Deleting…",
    confirm: "Confirm — permanent deletion",
    clean_one: "Clean {count} item ({size})",
    clean_other: "Clean {count} items ({size})",
  },
};
