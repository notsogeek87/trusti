package com.trusti.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(InstalledAppsPlugin.class);
        registerPlugin(TechnicalAnalysisPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
