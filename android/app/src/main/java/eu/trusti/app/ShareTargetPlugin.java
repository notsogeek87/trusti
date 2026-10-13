package eu.trusti.app;

import android.content.Intent;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Récepteur du menu « Partager » d'Android pour du texte (ex. le lien d'une
 * app depuis le Play Store ou F-Droid). Le texte est transmis tel quel à la
 * partie web par l'événement « sharedText » ({ text }) : c'est elle qui
 * l'analyse et le valide, car il vient d'une autre application.
 *
 * L'événement est retenu tant qu'aucun listener n'est enregistré (démarrage à
 * froid : le partage arrive avant que la page web ne soit prête).
 */
@CapacitorPlugin(name = "ShareTarget")
public class ShareTargetPlugin extends Plugin {

    private static final int MAX_LENGTH = 2000;

    @Override
    protected void handleOnNewIntent(Intent intent) {
        super.handleOnNewIntent(intent);
        if (intent == null || !Intent.ACTION_SEND.equals(intent.getAction())) {
            return;
        }
        String type = intent.getType();
        if (type == null || !type.startsWith("text/")) {
            return;
        }
        String text = intent.getStringExtra(Intent.EXTRA_TEXT);
        if (text == null || text.trim().isEmpty()) {
            return;
        }
        // L'intent peut être rejoué (retour au premier plan, recréation de
        // l'activité) : on le consomme pour ne pas rouvrir la fenêtre d'ajout.
        intent.removeExtra(Intent.EXTRA_TEXT);

        JSObject data = new JSObject();
        data.put("text", text.length() > MAX_LENGTH ? text.substring(0, MAX_LENGTH) : text);
        notifyListeners("sharedText", data, true);
    }
}
