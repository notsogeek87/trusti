package eu.trusti.app.ui.update

import android.content.Context
import androidx.activity.ComponentActivity
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.lielu.githubupdater.UpdateConfig
import com.lielu.githubupdater.UpdateException
import com.lielu.githubupdater.UpdateInfo
import com.lielu.githubupdater.UpdateManager
import com.lielu.githubupdater.UpdateState
import eu.trusti.app.BuildConfig
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import java.io.File

/** Résultat d'une recherche manuelle (bouton « Rechercher une mise à jour » des Paramètres). */
sealed interface ManualCheckResult {
    data class Available(val versionName: String?) : ManualCheckResult

    data object UpToDate : ManualCheckResult

    data object Busy : ManualCheckResult

    data object Disabled : ManualCheckResult

    data class Failed(val message: String) : ManualCheckResult
}

/**
 * Vérifie automatiquement les mises à jour à l'ouverture de l'app et pilote la fenêtre qui les propose.
 * L'état brut est celui de [UpdateManager], partagé avec le bouton des Paramètres (AppUpdatePlugin).
 */
class AppUpdateViewModel(
    private val updateManager: UpdateManager,
    private val updatesEnabled: Boolean,
) : ViewModel() {
    val state = updateManager.state

    private val _dismissed = MutableStateFlow(false)

    /** `true` une fois « Plus tard » touché : la fenêtre ne revient qu'au prochain lancement. */
    val dismissed: StateFlow<Boolean> = _dismissed

    private val _userStarted = MutableStateFlow(false)

    /** `true` dès que l'utilisateur a touché « Installer » : seulement alors on lui montre une erreur. */
    val userStarted: StateFlow<Boolean> = _userStarted

    /** `false` tant qu'Android n'a pas autorisé Trusti à installer des applications (étape à expliquer). */
    fun canInstallPackages(): Boolean = updateManager.canInstallPackages()

    /**
     * Appelée à chaque passage de l'app au premier plan. `force = true` : sans cela la bibliothèque réutilise
     * sa réponse précédente (« à jour ») jusqu'à `checkIntervalHours`, et une release publiée entre-temps
     * n'est pas vue. Une requête GitHub par ouverture reste très en dessous du quota (60/h).
     */
    fun checkOnOpen() {
        if (!updatesEnabled) return
        // Ne pas écraser une fenêtre déjà affichée, un téléchargement ou une installation en cours.
        val s = state.value
        if (s !is UpdateState.Idle && s !is UpdateState.UpToDate && s !is UpdateState.Error) return
        // Les erreurs (hors ligne, quota GitHub…) sont publiées dans `state` ; ici on reste silencieux.
        viewModelScope.launch { runCatching { updateManager.checkForUpdate(force = true) } }
    }

    /**
     * Recherche déclenchée par l'utilisateur : toujours forcée, et la fenêtre réapparaît même si
     * « Plus tard » a été touché. Le résultat est aussi renvoyé à l'appelant (retour dans les Paramètres).
     */
    fun checkManually(onResult: (ManualCheckResult) -> Unit) {
        if (!updatesEnabled) {
            onResult(ManualCheckResult.Disabled)
            return
        }
        when (state.value) {
            is UpdateState.Checking, is UpdateState.Downloading, is UpdateState.Installing -> {
                onResult(ManualCheckResult.Busy)
                return
            }
            is UpdateState.Downloaded -> {
                // APK déjà prêt : on remontre simplement la fenêtre d'installation.
                _dismissed.value = false
                onResult(ManualCheckResult.Available(null))
                return
            }
            else -> Unit
        }
        _dismissed.value = false
        _userStarted.value = false
        viewModelScope.launch {
            val result =
                try {
                    val update = updateManager.checkForUpdate(force = true)
                    if (update != null) ManualCheckResult.Available(update.versionName) else ManualCheckResult.UpToDate
                } catch (e: UpdateException) {
                    ManualCheckResult.Failed(updateErrorMessage(e.error))
                }
            onResult(result)
        }
    }

    fun onDismiss() {
        _dismissed.value = true
    }

    fun onInstall(update: UpdateInfo) {
        _userStarted.value = true
        viewModelScope.launch {
            runCatching {
                val apk = updateManager.downloadUpdate(update)
                install(apk)
            }
        }
    }

    /** Relance l'installation d'un APK déjà téléchargé, typiquement au retour des réglages Android. */
    fun onInstallDownloaded(apk: File) {
        _userStarted.value = true
        runCatching { install(apk) }
    }

    private fun install(apk: File) {
        if (updateManager.canInstallPackages()) {
            updateManager.installUpdate(apk)
        } else {
            updateManager.openInstallPermissionSettings()
        }
    }

    companion object {
        /** Dépôt GitHub de CETTE app (pas celui de la bibliothèque), qui publie l'APK dans ses releases. */
        private const val GITHUB_OWNER = "notsogeek87"
        private const val GITHUB_REPOSITORY = "trusti"

        /**
         * Mises à jour désactivées sur les builds Play Store et sur tout applicationId à suffixe
         * (ex. `.staging`) : leur APK ne peut pas être remplacé par celui de la release de production.
         */
        private fun updatesEnabled(context: Context): Boolean =
            BuildConfig.UPDATER_ENABLED && !context.packageName.endsWith(".staging")

        /** ViewModel unique de l'activité, partagé par la fenêtre Compose et le plugin des Paramètres. */
        fun of(activity: ComponentActivity): AppUpdateViewModel =
            ViewModelProvider(
                activity,
                object : ViewModelProvider.Factory {
                    @Suppress("UNCHECKED_CAST")
                    override fun <T : ViewModel> create(modelClass: Class<T>): T {
                        val context = activity.applicationContext
                        val manager =
                            UpdateManager(
                                context = context,
                                config =
                                    UpdateConfig(
                                        githubOwner = GITHUB_OWNER,
                                        githubRepository = GITHUB_REPOSITORY,
                                        apkAssetNamePattern = ".*\\.apk",
                                    ),
                            )
                        return AppUpdateViewModel(manager, updatesEnabled(context)) as T
                    }
                },
            )[AppUpdateViewModel::class.java]
    }
}
