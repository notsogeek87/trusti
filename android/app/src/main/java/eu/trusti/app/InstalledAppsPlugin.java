package eu.trusti.app;

import android.app.AppOpsManager;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Process;
import android.os.storage.StorageManager;
import android.app.usage.StorageStatsManager;
import android.app.usage.StorageStats;
import android.provider.Settings;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Détecte, parmi les apps du catalogue Trusti (voir R.array.trusti_catalog_packages,
 * généré par scripts/generate-android-catalog.js), lesquelles sont installées sur
 * l'appareil : on interroge uniquement les paquets déjà connus, ce qui reste dans le
 * cadre de la visibilité déclarée via <queries> dans AndroidManifest.xml (méthode du
 * build Google Play, sans la permission QUERY_ALL_PACKAGES).
 *
 * Scan complet (hasFullScan / getAllInstalledApps) : uniquement si la permission
 * QUERY_ALL_PACKAGES est déclarée, c'est-à-dire dans les APK des releases GitHub (elle
 * est retirée du build Play Store, voir src/release/AndroidManifest.xml). Le résultat
 * reste sur l'appareil.
 */
@CapacitorPlugin(name = "InstalledApps")
public class InstalledAppsPlugin extends Plugin {

    @PluginMethod
    public void getInstalledPackages(PluginCall call) {
        PackageManager pm = getContext().getPackageManager();
        String[] catalog = getContext().getResources().getStringArray(R.array.trusti_catalog_packages);

        JSArray installed = new JSArray();
        for (String packageName : catalog) {
            try {
                pm.getPackageInfo(packageName, 0);
                installed.put(packageName);
            } catch (PackageManager.NameNotFoundException e) {
                // Pas installée, on ignore.
            }
        }

        JSObject result = new JSObject();
        result.put("packages", installed);
        call.resolve(result);
    }

    private static final String QUERY_ALL_PACKAGES = "android.permission.QUERY_ALL_PACKAGES";

    /** true si ce build déclare QUERY_ALL_PACKAGES (APK GitHub), false pour le build Play Store. */
    private boolean isFullScanDeclared() {
        try {
            PackageInfo info = getContext().getPackageManager()
                .getPackageInfo(getContext().getPackageName(), PackageManager.GET_PERMISSIONS);
            if (info.requestedPermissions == null) {
                return false;
            }
            for (String permission : info.requestedPermissions) {
                if (QUERY_ALL_PACKAGES.equals(permission)) {
                    return true;
                }
            }
        } catch (Exception e) {
            // Introuvable : on considère le scan complet indisponible.
        }
        return false;
    }

    @PluginMethod
    public void hasFullScan(PluginCall call) {
        JSObject result = new JSObject();
        result.put("available", isFullScanDeclared());
        call.resolve(result);
    }

    /**
     * Toutes les apps installées : { apps: [{ packageName, label, system, launchable }] }.
     * "system" : app système non mise à jour par l'utilisateur ; "launchable" : possède une
     * icône de lancement (app qu'on utilise, par opposition aux services et bibliothèques).
     * Le tri est laissé à la partie web. Refusé si la permission n'est pas déclarée.
     */
    @SuppressWarnings("deprecation")
    @PluginMethod
    public void getAllInstalledApps(PluginCall call) {
        if (!isFullScanDeclared()) {
            call.reject("Scan complet indisponible dans ce build");
            return;
        }
        PackageManager pm = getContext().getPackageManager();
        String self = getContext().getPackageName();

        JSArray apps = new JSArray();
        for (ApplicationInfo info : pm.getInstalledApplications(0)) {
            if (self.equals(info.packageName)) {
                continue;
            }
            boolean system = (info.flags & ApplicationInfo.FLAG_SYSTEM) != 0
                && (info.flags & ApplicationInfo.FLAG_UPDATED_SYSTEM_APP) == 0;
            JSObject app = new JSObject();
            app.put("packageName", info.packageName);
            app.put("label", String.valueOf(pm.getApplicationLabel(info)));
            app.put("system", system);
            app.put("launchable", pm.getLaunchIntentForPackage(info.packageName) != null);
            apps.put(app);
        }

        JSObject result = new JSObject();
        result.put("apps", apps);
        call.resolve(result);
    }

    /**
     * Ouvre la boîte de dialogue système de désinstallation pour le paquet donné
     * (Intent.ACTION_DELETE). Ne désinstalle rien silencieusement : l'utilisateur
     * doit confirmer dans l'UI native Android, comme pour une désinstallation
     * classique depuis le launcher.
     */
    @PluginMethod
    public void uninstallPackage(PluginCall call) {
        String packageName = call.getString("packageName");
        if (packageName == null || packageName.isEmpty()) {
            call.reject("packageName manquant");
            return;
        }

        try {
            Intent intent = new Intent(Intent.ACTION_DELETE, Uri.parse("package:" + packageName));
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(intent);
            call.resolve();
        } catch (Exception e) {
            call.reject("Désinstallation impossible : " + e.getMessage(), e);
        }
    }

    /**
     * La taille réelle occupée par une app (APK + données + cache) n'est lisible,
     * pour un paquet qui n'est pas le nôtre, qu'avec la permission spéciale
     * PACKAGE_USAGE_STATS — un accès "Usage" que l'utilisateur doit activer
     * manuellement dans les réglages système (aucune boîte de dialogue standard
     * ne peut la demander, contrairement aux permissions runtime classiques).
     * On expose ici un simple contrôle de l'état de cet accès.
     */
    @PluginMethod
    public void hasUsageAccess(PluginCall call) {
        JSObject result = new JSObject();
        result.put("granted", checkUsageAccess());
        call.resolve(result);
    }

    private boolean checkUsageAccess() {
        AppOpsManager appOps = (AppOpsManager) getContext().getSystemService(Context.APP_OPS_SERVICE);
        if (appOps == null) return false;
        int mode = appOps.checkOpNoThrow(
            AppOpsManager.OPSTR_GET_USAGE_STATS,
            Process.myUid(),
            getContext().getPackageName()
        );
        return mode == AppOpsManager.MODE_ALLOWED;
    }

    /**
     * Ouvre l'écran système "Accès à l'utilisation" où l'utilisateur peut activer
     * cet accès pour Trusti. On ne peut pas savoir depuis ce seul appel s'il
     * l'a réellement activé : l'app doit rappeler hasUsageAccess() au retour.
     */
    @PluginMethod
    public void openUsageAccessSettings(PluginCall call) {
        try {
            Intent intent = new Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(intent);
            call.resolve();
        } catch (Exception e) {
            call.reject("Impossible d'ouvrir les réglages : " + e.getMessage(), e);
        }
    }

    /**
     * Taille sur le disque (APK + données + cache) de chaque app du catalogue
     * Trusti installée sur l'appareil, en octets. Nécessite l'accès "Usage"
     * (voir hasUsageAccess) et l'API 26+ (StorageStatsManager) ; sans l'un ou
     * l'autre, renvoie une liste vide plutôt qu'une erreur — à l'appelant de
     * vérifier hasUsageAccess() avant d'afficher cette donnée comme fiable.
     */
    @PluginMethod
    public void getAppSizes(PluginCall call) {
        JSObject sizes = new JSObject();

        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O || !checkUsageAccess()) {
            JSObject result = new JSObject();
            result.put("sizes", sizes);
            call.resolve(result);
            return;
        }

        PackageManager pm = getContext().getPackageManager();
        StorageStatsManager storageStatsManager =
            (StorageStatsManager) getContext().getSystemService(Context.STORAGE_STATS_SERVICE);
        String[] catalog = getContext().getResources().getStringArray(R.array.trusti_catalog_packages);

        for (String packageName : catalog) {
            try {
                pm.getPackageInfo(packageName, 0); // Ignore si non installée
                StorageStats stats = storageStatsManager.queryStatsForPackage(
                    StorageManager.UUID_DEFAULT,
                    packageName,
                    Process.myUserHandle()
                );
                long totalBytes = stats.getAppBytes() + stats.getDataBytes() + stats.getCacheBytes();
                sizes.put(packageName, totalBytes);
            } catch (Exception e) {
                // Non installée, ou stats indisponibles pour ce paquet précis : on
                // l'omet plutôt que de faire échouer tout l'appel pour les autres.
            }
        }

        JSObject result = new JSObject();
        result.put("sizes", sizes);
        call.resolve(result);
    }
}
