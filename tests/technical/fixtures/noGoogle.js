/**
 * Fixture : app sans dépendance Google, tracker ni SDK connu.
 */
export const noGoogleFixture = {
  packageName: 'org.example.minimal',
  componentsAvailable: true,
  appInfo: {
    name: 'Minimal App',
    versionName: '1.0.0',
    versionCode: 1,
    minSdkVersion: 24,
    targetSdkVersion: 34,
    sizeBytes: 5_000_000,
    isSystemApp: false,
    firstInstallTime: 1700000000000,
    lastUpdateTime: 1700000000000,
    installerPackageName: 'com.android.vending',
    apkPath: '/data/app/org.example.minimal/base.apk',
    splitApkPaths: [],
  },
  permissions: [
    { name: 'android.permission.INTERNET', protectionLevel: 'normal', granted: true },
    { name: 'android.permission.ACCESS_NETWORK_STATE', protectionLevel: 'normal', granted: true },
  ],
  components: {
    services: ['org.example.minimal.SyncService'],
    receivers: [],
    providers: [],
    activities: ['org.example.minimal.MainActivity'],
  },
  metaDataKeys: [],
};

export default noGoogleFixture;
