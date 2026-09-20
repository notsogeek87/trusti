/**
 * Fixture : app avec Firebase Cloud Messaging + Google Play Services +
 * une permission sensible accordée.
 */
export const withFirebaseFixture = {
  packageName: 'org.example.withfirebase',
  componentsAvailable: true,
  appInfo: {
    name: 'Firebase App',
    versionName: '2.3.1',
    versionCode: 42,
    minSdkVersion: 24,
    targetSdkVersion: 35,
    sizeBytes: 42_000_000,
    isSystemApp: false,
    firstInstallTime: 1700000000000,
    lastUpdateTime: 1705000000000,
    installerPackageName: 'com.android.vending',
    apkPath: '/data/app/org.example.withfirebase/base.apk',
    splitApkPaths: ['/data/app/org.example.withfirebase/split_config.arm64_v8a.apk'],
  },
  permissions: [
    { name: 'android.permission.INTERNET', protectionLevel: 'normal', granted: true },
    { name: 'android.permission.ACCESS_FINE_LOCATION', protectionLevel: 'dangerous', granted: true },
    { name: 'android.permission.POST_NOTIFICATIONS', protectionLevel: 'dangerous', granted: false },
  ],
  components: {
    services: [
      'com.google.firebase.messaging.FirebaseMessagingService',
      'com.google.firebase.components.ComponentDiscoveryService',
    ],
    receivers: [],
    providers: ['com.google.firebase.provider.FirebaseInitProvider'],
    activities: [],
  },
  metaDataKeys: ['com.google.android.gms.version'],
};

export default withFirebaseFixture;
