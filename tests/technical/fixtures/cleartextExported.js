/**
 * Fixture : app debuggable, cleartext HTTP autorisé, plusieurs composants
 * exportés, sans Network Security Config déclaré.
 */
export const cleartextExportedFixture = {
  packageName: 'org.example.cleartext',
  componentsAvailable: true,
  appInfo: {
    name: 'Cleartext App',
    versionName: '0.9.0',
    versionCode: 9,
    minSdkVersion: 24,
    targetSdkVersion: 28,
    sizeBytes: 20_000_000,
    isSystemApp: false,
    firstInstallTime: 1690000000000,
    lastUpdateTime: 1704000000000,
    installerPackageName: null,
    apkPath: '/data/app/org.example.cleartext/base.apk',
    splitApkPaths: [],
  },
  permissions: [
    { name: 'android.permission.INTERNET', protectionLevel: 'normal', granted: true },
  ],
  components: { services: [], receivers: [], providers: [], activities: [] },
  metaDataKeys: [],
  componentCounts: {
    activities: 3,
    services: 2,
    receivers: 1,
    providers: 1,
    exportedActivities: 2,
    exportedServices: 1,
    exportedReceivers: 0,
    exportedProviders: 1,
  },
  security: {
    debuggable: true,
    allowBackup: true,
    usesCleartextTraffic: true,
    networkSecurityConfigPresent: false,
    signingCertificatesSha256: ['AB12CD34EF56'],
    hasMultipleSigners: false,
  },
};

export default cleartextExportedFixture;
