/**
 * Fixture : app avec plusieurs SDK "outils développeur" (Sentry, Unity, RevenueCat)
 * mais aucun tracker ni dépendance Google.
 */
export const multipleSdksFixture = {
  packageName: 'org.example.sdks',
  componentsAvailable: true,
  appInfo: {
    name: 'SDKs App',
    versionName: '1.2.0',
    versionCode: 12,
    minSdkVersion: 24,
    targetSdkVersion: 34,
    sizeBytes: 120_000_000,
    isSystemApp: false,
    firstInstallTime: 1690000000000,
    lastUpdateTime: 1704000000000,
    installerPackageName: null,
    apkPath: '/data/app/org.example.sdks/base.apk',
    splitApkPaths: [],
  },
  permissions: [
    { name: 'android.permission.INTERNET', protectionLevel: 'normal', granted: true },
    { name: 'android.permission.VIBRATE', protectionLevel: 'normal', granted: true },
  ],
  components: {
    services: ['com.unity3d.player.UnityPlayer'],
    receivers: [],
    providers: ['io.sentry.android.core.SentryInitProvider'],
    activities: ['com.revenuecat.purchases.ui.PaywallActivity'],
  },
  metaDataKeys: ['io.sentry.dsn'],
};

export default multipleSdksFixture;
