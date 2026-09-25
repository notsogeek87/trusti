package com.trusti.app;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import androidx.activity.result.ActivityResult;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

/**
 * Enregistrement direct d'un fichier via le sélecteur système Android
 * (Storage Access Framework, ACTION_CREATE_DOCUMENT) : l'utilisateur choisit
 * l'emplacement et confirme, sans passer par la feuille de partage. Utilisé
 * par l'export des données Trusti (Réglages > Espace de stockage), qui doit
 * "s'enregistrer" plutôt que se "partager".
 */
@CapacitorPlugin(name = "SaveFile")
public class SaveFilePlugin extends Plugin {

    @PluginMethod
    public void saveFile(PluginCall call) {
        String filename = call.getString("filename");
        String content = call.getString("content");
        String mimeType = call.getString("mimeType", "application/json");

        if (filename == null || content == null) {
            call.reject("filename/content manquant");
            return;
        }

        Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType(mimeType);
        intent.putExtra(Intent.EXTRA_TITLE, filename);
        startActivityForResult(call, intent, "handleSaveResult");
    }

    @ActivityCallback
    private void handleSaveResult(PluginCall call, ActivityResult result) {
        if (call == null) return;

        if (result.getResultCode() != Activity.RESULT_OK || result.getData() == null) {
            call.reject("Enregistrement annulé");
            return;
        }

        Uri uri = result.getData().getData();
        if (uri == null) {
            call.reject("Emplacement invalide");
            return;
        }

        String content = call.getString("content");
        try (OutputStream out = getContext().getContentResolver().openOutputStream(uri)) {
            if (out == null) {
                call.reject("Impossible d'ouvrir l'emplacement choisi");
                return;
            }
            out.write(content.getBytes(StandardCharsets.UTF_8));
            JSObject result2 = new JSObject();
            result2.put("uri", uri.toString());
            call.resolve(result2);
        } catch (Exception e) {
            call.reject("Écriture impossible : " + e.getMessage(), e);
        }
    }
}
