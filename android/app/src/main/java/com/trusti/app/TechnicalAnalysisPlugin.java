package com.trusti.app;

import android.content.pm.ActivityInfo;
import android.content.pm.ApplicationInfo;
import android.content.pm.ComponentInfo;
import android.content.pm.InstallSourceInfo;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.pm.PermissionInfo;
import android.content.pm.ProviderInfo;
import android.content.pm.ServiceInfo;
import android.os.Build;
import android.os.Bundle;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.File;
import java.util.HashSet;
import java.util.Set;

/**
 * Analyse technique locale d'une application installée : informations générales,
 * permissions déclarées/accordées, composants du manifeste (services, receivers,
 * providers, activities) et clés de méta-données. Sert uniquement de fournisseur
 * de données brutes ; la détection Google/SDK/trackers et le calcul du niveau de
 * dépendance se font côté JS (voir src/technical/), à partir de ces données —
 * voir src/technical/source/RawPackageData.js pour le contrat exact.
 *
 * Comme InstalledAppsPlugin, ne fonctionne que sur les paquets déclarés dans
 * <queries> (AndroidManifest.xml) : aucune énumération globale du téléphone,
 * aucune donnée envoyée à un serveur — tout reste local.
 */
@CapacitorPlugin(name = "TechnicalAnalysis")
public class TechnicalAnalysisPlugin extends Plugin {

    @PluginMethod
    public void analyzePackage(PluginCall call) {
        String packageName = call.getString("packageName");
        if (packageName == null || packageName.isEmpty()) {
            call.reject("packageName manquant");
            return;
        }

        PackageManager pm = getContext().getPackageManager();
        int flags = PackageManager.GET_PERMISSIONS
                | PackageManager.GET_SERVICES
                | PackageManager.GET_RECEIVERS
                | PackageManager.GET_PROVIDERS
                | PackageManager.GET_ACTIVITIES
                | PackageManager.GET_META_DATA;

        try {
            PackageInfo packageInfo = pm.getPackageInfo(packageName, flags);
            ApplicationInfo appInfo = packageInfo.applicationInfo;

            JSObject result = new JSObject();
            result.put("packageName", packageName);
            result.put("componentsAvailable", true);
            result.put("appInfo", buildAppInfo(pm, packageName, packageInfo, appInfo));
            result.put("permissions", buildPermissions(pm, packageInfo));
            result.put("components", buildComponents(packageInfo));
            result.put("metaDataKeys", buildMetaDataKeys(packageInfo, appInfo));

            call.resolve(result);
        } catch (PackageManager.NameNotFoundException e) {
            call.reject("Application non trouvée ou non visible (voir <queries> dans le manifeste) : " + packageName, e);
        }
    }

    private JSObject buildAppInfo(PackageManager pm, String packageName, PackageInfo packageInfo, ApplicationInfo appInfo) {
        JSObject appInfoJs = new JSObject();

        CharSequence label = appInfo != null ? pm.getApplicationLabel(appInfo) : null;
        appInfoJs.put("name", label != null ? label.toString() : packageName);

        appInfoJs.put("versionName", packageInfo.versionName);
        long versionCode = Build.VERSION.SDK_INT >= Build.VERSION_CODES.P
                ? packageInfo.getLongVersionCode()
                : packageInfo.versionCode;
        appInfoJs.put("versionCode", versionCode);

        // minSdkVersion existe sur ApplicationInfo depuis l'API 24, qui est le
        // minSdkVersion de Trusti lui-même (voir android/variables.gradle) : toujours disponible ici.
        appInfoJs.put("minSdkVersion", appInfo != null ? appInfo.minSdkVersion : JSObject.NULL);
        appInfoJs.put("targetSdkVersion", appInfo != null ? appInfo.targetSdkVersion : JSObject.NULL);
        appInfoJs.put("isSystemApp", appInfo != null && (appInfo.flags & ApplicationInfo.FLAG_SYSTEM) != 0);
        appInfoJs.put("firstInstallTime", packageInfo.firstInstallTime);
        appInfoJs.put("lastUpdateTime", packageInfo.lastUpdateTime);

        String apkPath = appInfo != null ? appInfo.sourceDir : null;
        appInfoJs.put("apkPath", apkPath);

        long sizeBytes = fileSize(apkPath);
        JSArray splitPaths = new JSArray();
        if (appInfo != null && appInfo.splitSourceDirs != null) {
            for (String split : appInfo.splitSourceDirs) {
                splitPaths.put(split);
                sizeBytes += fileSize(split);
            }
        }
        appInfoJs.put("splitApkPaths", splitPaths);
        appInfoJs.put("sizeBytes", sizeBytes > 0 ? sizeBytes : JSObject.NULL);

        appInfoJs.put("installerPackageName", resolveInstallerPackageName(pm, packageName));

        return appInfoJs;
    }

    private String resolveInstallerPackageName(PackageManager pm, String packageName) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                InstallSourceInfo info = pm.getInstallSourceInfo(packageName);
                return info.getInstallingPackageName();
            }
            return pm.getInstallerPackageName(packageName);
        } catch (Exception e) {
            // Source d'installation non déterminable (ex. absente, ou accès restreint) : reste inconnue.
            return null;
        }
    }

    private long fileSize(String path) {
        if (path == null) return 0;
        File file = new File(path);
        return file.exists() ? file.length() : 0;
    }

    /**
     * Distingue explicitement permission déclarée / accordée (voir spec §5) :
     * `granted` reste `null` (→ UNKNOWN côté JS) si le système ne fournit pas
     * l'information plutôt que de risquer un faux positif/négatif.
     */
    private JSArray buildPermissions(PackageManager pm, PackageInfo packageInfo) {
        JSArray permissionsJs = new JSArray();
        String[] requested = packageInfo.requestedPermissions;
        int[] requestedFlags = packageInfo.requestedPermissionsFlags;
        if (requested == null) return permissionsJs;

        for (int i = 0; i < requested.length; i++) {
            String permissionName = requested[i];
            JSObject permJs = new JSObject();
            permJs.put("name", permissionName);
            permJs.put("protectionLevel", resolveProtectionLevel(pm, permissionName));

            if (requestedFlags != null && i < requestedFlags.length) {
                boolean granted = (requestedFlags[i] & PackageInfo.REQUESTED_PERMISSION_GRANTED) != 0;
                permJs.put("granted", granted);
            } else {
                permJs.put("granted", JSObject.NULL);
            }

            permissionsJs.put(permJs);
        }
        return permissionsJs;
    }

    private String resolveProtectionLevel(PackageManager pm, String permissionName) {
        try {
            PermissionInfo permissionInfo = pm.getPermissionInfo(permissionName, 0);
            int base = permissionInfo.protectionLevel & PermissionInfo.PROTECTION_MASK_BASE;
            if (base == PermissionInfo.PROTECTION_NORMAL) return "normal";
            if (base == PermissionInfo.PROTECTION_DANGEROUS) return "dangerous";
            if (base == PermissionInfo.PROTECTION_SIGNATURE) return "signature";
            return "unknown";
        } catch (PackageManager.NameNotFoundException e) {
            // Permission personnalisée non résolue par le système : niveau non déterminable.
            return "unknown";
        }
    }

    private JSObject buildComponents(PackageInfo packageInfo) {
        JSObject componentsJs = new JSObject();
        componentsJs.put("services", classNamesOf(packageInfo.services));
        componentsJs.put("receivers", classNamesOf(packageInfo.receivers));
        componentsJs.put("providers", classNamesOf(packageInfo.providers));
        componentsJs.put("activities", classNamesOf(packageInfo.activities));
        return componentsJs;
    }

    private JSArray classNamesOf(ComponentInfo[] components) {
        JSArray names = new JSArray();
        if (components != null) {
            for (ComponentInfo component : components) {
                names.put(component.name);
            }
        }
        return names;
    }

    /**
     * Ne conserve que les CLÉS des <meta-data> (app-level + par composant), jamais
     * leurs valeurs : certaines contiennent des identifiants/clés API du développeur
     * qui n'ont pas leur place dans une analyse locale destinée à l'utilisateur.
     */
    private JSArray buildMetaDataKeys(PackageInfo packageInfo, ApplicationInfo appInfo) {
        Set<String> keys = new HashSet<>();
        collectMetaDataKeys(appInfo != null ? appInfo.metaData : null, keys);
        collectMetaDataKeys(packageInfo.services, keys);
        collectMetaDataKeys(packageInfo.receivers, keys);
        collectMetaDataKeys(packageInfo.providers, keys);
        collectMetaDataKeys(packageInfo.activities, keys);

        JSArray metaDataKeys = new JSArray();
        for (String key : keys) {
            metaDataKeys.put(key);
        }
        return metaDataKeys;
    }

    private void collectMetaDataKeys(ComponentInfo[] components, Set<String> out) {
        if (components == null) return;
        for (ComponentInfo component : components) {
            collectMetaDataKeys(component.metaData, out);
        }
    }

    private void collectMetaDataKeys(Bundle metaData, Set<String> out) {
        if (metaData == null) return;
        for (String key : metaData.keySet()) {
            out.add(key);
        }
    }
}
