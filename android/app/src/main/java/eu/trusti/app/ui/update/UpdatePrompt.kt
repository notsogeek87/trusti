package eu.trusti.app.ui.update

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import android.content.res.Resources
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import eu.trusti.app.R
import androidx.compose.ui.unit.dp
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.compose.LifecycleEventEffect
import com.lielu.githubupdater.UpdateError
import com.lielu.githubupdater.UpdateState

/** Fenêtre proposant une mise à jour trouvée au lancement, avec les étapes à suivre expliquées. */
@Composable
fun UpdatePrompt(viewModel: AppUpdateViewModel) {
    val state by viewModel.state.collectAsState()
    val dismissed by viewModel.dismissed.collectAsState()
    val userStarted by viewModel.userStarted.collectAsState()

    // ON_START : au lancement ET quand l'app, restée en mémoire, repasse au premier plan.
    LifecycleEventEffect(Lifecycle.Event.ON_START) { viewModel.checkOnOpen() }

    if (dismissed) return

    when (val s = state) {
        is UpdateState.UpdateAvailable ->
            AlertDialog(
                onDismissRequest = viewModel::onDismiss,
                title = { Text(stringResource(R.string.update_available)) },
                text = {
                    UpdateSteps(
                        intro = stringResource(R.string.update_ready_intro, s.update.versionName ?: ""),
                        steps =
                            listOf(
                                stringResource(R.string.update_step_install),
                                stringResource(R.string.update_step_allow),
                                stringResource(R.string.update_step_confirm),
                            ),
                    )
                },
                confirmButton = {
                    TextButton(onClick = { viewModel.onInstall(s.update) }) { Text("Installer") }
                },
                dismissButton = {
                    TextButton(onClick = viewModel::onDismiss) { Text("Plus tard") }
                },
            )
        is UpdateState.Downloading ->
            AlertDialog(
                onDismissRequest = {},
                title = { Text(stringResource(R.string.update_downloading)) },
                text = {
                    LinearProgressIndicator(
                        progress = { (s.progress.percentage ?: 0) / 100f },
                        modifier = Modifier.fillMaxWidth(),
                    )
                },
                confirmButton = {},
            )
        is UpdateState.Downloaded ->
            AlertDialog(
                onDismissRequest = viewModel::onDismiss,
                title = { Text(stringResource(R.string.update_downloaded)) },
                text = {
                    if (viewModel.canInstallPackages()) {
                        UpdateSteps(
                            intro = stringResource(R.string.update_only_install),
                            steps = listOf(stringResource(R.string.update_step_install_confirm)),
                        )
                    } else {
                        UpdateSteps(
                            intro = stringResource(R.string.update_need_permission),
                            steps =
                                listOf(
                                    stringResource(R.string.update_step_settings),
                                    stringResource(R.string.update_step_source),
                                    stringResource(R.string.update_step_again),
                                ),
                        )
                    }
                },
                confirmButton = {
                    TextButton(onClick = { viewModel.onInstallDownloaded(s.file) }) { Text("Installer") }
                },
                dismissButton = {
                    TextButton(onClick = viewModel::onDismiss) { Text("Plus tard") }
                },
            )
        is UpdateState.Error ->
            if (userStarted) {
                AlertDialog(
                    onDismissRequest = viewModel::onDismiss,
                    title = { Text(stringResource(R.string.update_failed_title)) },
                    text = { Text(updateErrorMessage(LocalContext.current.resources, s.error)) },
                    confirmButton = {
                        TextButton(onClick = viewModel::onDismiss) { Text(stringResource(R.string.update_ok)) }
                    },
                )
            }
        else -> Unit
    }
}

@Composable
private fun UpdateSteps(
    intro: String,
    steps: List<String>,
) {
    Column {
        Text(intro, style = MaterialTheme.typography.bodyMedium)
        steps.forEachIndexed { index, step ->
            Text(
                "${index + 1}. $step",
                style = MaterialTheme.typography.bodyMedium,
                modifier = Modifier.padding(top = 8.dp),
            )
        }
        Text(
            stringResource(R.string.update_data_kept),
            style = MaterialTheme.typography.labelSmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.padding(top = 12.dp),
        )
    }
}

internal fun updateErrorMessage(resources: Resources, error: UpdateError): String =
    when (error) {
        is UpdateError.NetworkError -> resources.getString(R.string.update_err_network)
        is UpdateError.RateLimit -> resources.getString(R.string.update_err_rate)
        UpdateError.ReleaseNotFound -> resources.getString(R.string.update_err_no_release)
        is UpdateError.ApkNotFound -> resources.getString(R.string.update_err_no_apk)
        UpdateError.InstallationNotAllowed -> resources.getString(R.string.update_err_not_allowed)
        else -> resources.getString(R.string.update_err_other, error.message ?: "")
    }
