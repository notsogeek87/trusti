/**
 * Fixture : app multi-architecture avec bibliothèques natives et split APK.
 */
export const multiArchNativeLibsFixture = {
  packageName: 'org.example.nativelibs',
  componentsAvailable: true,
  appInfo: {
    name: 'Native Libs App',
    versionName: '7.0.0',
    versionCode: 70,
    minSdkVersion: 24,
    targetSdkVersion: 34,
    sizeBytes: 150_000_000,
    isSystemApp: false,
    firstInstallTime: 1690000000000,
    lastUpdateTime: 1704000000000,
    installerPackageName: 'com.android.vending',
    apkPath: '/data/app/org.example.nativelibs/base.apk',
    splitApkPaths: [
      '/data/app/org.example.nativelibs/split_config.arm64_v8a.apk',
      '/data/app/org.example.nativelibs/split_config.armeabi_v7a.apk',
    ],
  },
  permissions: [
    { name: 'android.permission.INTERNET', protectionLevel: 'normal', granted: true },
  ],
  components: { services: [], receivers: [], providers: [], activities: [] },
  metaDataKeys: [],
  componentCounts: {
    activities: 5,
    services: 1,
    receivers: 0,
    providers: 1,
    exportedActivities: 1,
    exportedServices: 0,
    exportedReceivers: 0,
    exportedProviders: 0,
  },
  composition: {
    totalSizeBytes: 150_000_000,
    apkSizeBytes: 90_000_000,
    dexCount: 2,
    nativeLibraryCount: 5,
    architectures: ['arm64-v8a', 'armeabi-v7a', 'x86_64'],
    isSplitApk: true,
    splitCount: 2,
  },
};

export default multiArchNativeLibsFixture;
