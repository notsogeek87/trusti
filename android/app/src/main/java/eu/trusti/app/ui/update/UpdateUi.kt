@file:JvmName("UpdateUi")

package eu.trusti.app.ui.update

import android.view.ViewGroup
import androidx.activity.ComponentActivity
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.ui.platform.ComposeView
import androidx.compose.ui.platform.ViewCompositionStrategy

/**
 * Ajoute la fenêtre de mise à jour (Compose) par-dessus la WebView Capacitor. La vue elle-même est
 * invisible : seules les AlertDialog qu'elle affiche (leur propre fenêtre) se voient.
 * À appeler depuis MainActivity.onCreate, après super.onCreate.
 */
fun attachUpdatePrompt(activity: ComponentActivity) {
    val viewModel = AppUpdateViewModel.of(activity)
    val view =
        ComposeView(activity).apply {
            setViewCompositionStrategy(ViewCompositionStrategy.DisposeOnViewTreeLifecycleDestroyed)
            setContent {
                MaterialTheme(colorScheme = if (isSystemInDarkTheme()) darkColorScheme() else lightColorScheme()) {
                    UpdatePrompt(viewModel)
                }
            }
        }
    activity.addContentView(
        view,
        ViewGroup.LayoutParams(ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT),
    )
}
