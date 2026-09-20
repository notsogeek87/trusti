/**
 * Fixture : app déclarant plusieurs permissions sensibles, avec des statuts
 * d'octroi mixtes (accordée / refusée / inconnue), et une permission dont le
 * niveau de protection n'a pas pu être déterminé (permission personnalisée).
 */
export const sensitivePermissionsFixture = {
  packageName: 'org.example.permissions',
  componentsAvailable: true,
  appInfo: {
    name: 'Permissions App',
    versionName: '3.1.4',
    versionCode: 31,
    minSdkVersion: 24,
    targetSdkVersion: 34,
    sizeBytes: 15_000_000,
    isSystemApp: false,
    firstInstallTime: 1690000000000,
    lastUpdateTime: 1704000000000,
    installerPackageName: 'com.android.vending',
    apkPath: '/data/app/org.example.permissions/base.apk',
    splitApkPaths: [],
  },
  permissions: [
    { name: 'android.permission.CAMERA', protectionLevel: 'dangerous', granted: true },
    { name: 'android.permission.RECORD_AUDIO', protectionLevel: 'dangerous', granted: false },
    { name: 'android.permission.READ_CONTACTS', protectionLevel: 'dangerous', granted: null },
    { name: 'org.example.permissions.permission.CUSTOM_ACCESS', protectionLevel: undefined, granted: true },
  ],
  components: { services: [], receivers: [], providers: [], activities: [] },
  metaDataKeys: [],
};

export default sensitivePermissionsFixture;
