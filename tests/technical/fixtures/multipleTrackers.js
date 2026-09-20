/**
 * Fixture : app avec plusieurs trackers connus (Meta, AppsFlyer, Adjust, OneSignal).
 */
export const multipleTrackersFixture = {
  packageName: 'org.example.trackers',
  componentsAvailable: true,
  appInfo: {
    name: 'Trackers App',
    versionName: '5.0.0',
    versionCode: 500,
    minSdkVersion: 24,
    targetSdkVersion: 34,
    sizeBytes: 80_000_000,
    isSystemApp: false,
    firstInstallTime: 1690000000000,
    lastUpdateTime: 1704000000000,
    installerPackageName: 'com.android.vending',
    apkPath: '/data/app/org.example.trackers/base.apk',
    splitApkPaths: [],
  },
  permissions: [
    { name: 'android.permission.INTERNET', protectionLevel: 'normal', granted: true },
  ],
  components: {
    services: [
      'com.appsflyer.SingleInstallBroadcastReceiver',
      'com.onesignal.FCMBroadcastReceiver',
    ],
    receivers: [
      'com.adjust.sdk.AdjustReferrerReceiver',
    ],
    providers: [],
    activities: [
      'com.facebook.appevents.AppEventsLogger$FlushBroadcastReceiver',
    ],
  },
  metaDataKeys: ['com.facebook.sdk.ApplicationId'],
};

export default multipleTrackersFixture;
