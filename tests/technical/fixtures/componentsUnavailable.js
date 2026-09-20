/**
 * Fixture : la lecture des composants du manifeste a échoué côté natif — le
 * moteur doit rester honnête (UNKNOWN) plutôt que de conclure à une absence.
 */
export const componentsUnavailableFixture = {
  packageName: 'org.example.restricted',
  componentsAvailable: false,
  appInfo: {
    name: 'Restricted App',
    versionName: '1.0.0',
    versionCode: 1,
    minSdkVersion: 24,
    targetSdkVersion: 34,
    sizeBytes: null,
    isSystemApp: false,
    firstInstallTime: null,
    lastUpdateTime: null,
    installerPackageName: null,
    apkPath: null,
    splitApkPaths: [],
  },
  permissions: [],
  components: { services: [], receivers: [], providers: [], activities: [] },
  metaDataKeys: [],
};

export default componentsUnavailableFixture;
