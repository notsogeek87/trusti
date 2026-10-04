package eu.trusti.app

import androidx.activity.ComponentActivity
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import eu.trusti.app.ui.update.AppUpdateViewModel
import eu.trusti.app.ui.update.ManualCheckResult

/**
 * Pont du bouton « Rechercher une mise à jour » (Paramètres, côté web). Déclenche une recherche
 * forcée ; si une version est disponible, la fenêtre Compose (UpdatePrompt) s'affiche par-dessus
 * l'app et guide l'installation. `status` : available | upToDate | busy | disabled | error.
 */
@CapacitorPlugin(name = "AppUpdate")
class AppUpdatePlugin : Plugin() {
    @PluginMethod
    fun checkForUpdate(call: PluginCall) {
        val activity = activity as ComponentActivity
        // Le ViewModel est lié à l'UI : accès depuis le thread principal.
        activity.runOnUiThread {
            AppUpdateViewModel.of(activity).checkManually { result ->
                val out = JSObject().put("currentVersion", BuildConfig.VERSION_NAME)
                when (result) {
                    is ManualCheckResult.Available -> {
                        out.put("status", "available")
                        result.versionName?.let { out.put("version", it) }
                    }
                    ManualCheckResult.UpToDate -> out.put("status", "upToDate")
                    ManualCheckResult.Busy -> out.put("status", "busy")
                    ManualCheckResult.Disabled -> out.put("status", "disabled")
                    is ManualCheckResult.Failed -> out.put("status", "error").put("message", result.message)
                }
                call.resolve(out)
            }
        }
    }
}
