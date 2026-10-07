package eu.trusti.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import eu.trusti.app.ui.update.UpdateUi;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(InstalledAppsPlugin.class);
        registerPlugin(TechnicalAnalysisPlugin.class);
        registerPlugin(SaveFilePlugin.class);
        registerPlugin(AppUpdatePlugin.class);
        registerPlugin(SystemCleanerPlugin.class);
        super.onCreate(savedInstanceState);
        // Fenêtre de mise à jour (Compose) ; la recherche a lieu à chaque ON_START (voir UpdatePrompt).
        UpdateUi.attachUpdatePrompt(this);
    }
}
