package app.trusti.mobile;

import android.content.pm.PackageManager;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Détecte, parmi les apps du catalogue Trusti (voir R.array.trusti_catalog_packages,
 * généré par scripts/generate-android-catalog.js), lesquelles sont installées sur
 * l'appareil. On ne fait jamais d'énumération complète des apps du téléphone : on
 * interroge uniquement les paquets déjà connus, ce qui reste dans le cadre de la
 * visibilité déclarée via <queries> dans AndroidManifest.xml (pas besoin de la
 * permission QUERY_ALL_PACKAGES).
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
}
