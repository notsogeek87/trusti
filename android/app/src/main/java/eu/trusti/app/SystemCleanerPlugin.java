package eu.trusti.app;

import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.Settings;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.regex.Pattern;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

/**
 * Nettoyeur de stockage partagé (équivalent allégé du SystemCleaner de SD Maid SE).
 *
 * Les règles viennent du JS (src/cleaner/filters.js, seule source de vérité) ; ce plugin n'en
 * implémente que la sémantique, qui doit rester alignée sur matchesFilter() de ce fichier JS.
 *
 * Garde-fous :
 *  - scan() ne supprime rien ;
 *  - deleteFilters() ne reçoit AUCUN chemin du JS, seulement des ids de filtres : il supprime
 *    exclusivement ce que le dernier scan() a trouvé pour ces filtres, et uniquement si le
 *    fichier n'a pas été modifié depuis ;
 *  - ni android/data, ni android/obb, ni les liens symboliques ne sont parcourus ;
 *  - les dossiers sont supprimés avec File.delete(), qui refuse un dossier non vide.
 *
 * Nécessite l'accès spécial "Accès à tous les fichiers" (MANAGE_EXTERNAL_STORAGE, API 30+),
 * déclaré dans le manifeste principal (builds GitHub) et retiré du build Play Store.
 */
@CapacitorPlugin(name = "SystemCleaner")
public class SystemCleanerPlugin extends Plugin {

    private static final long DAY_MS = 24L * 60 * 60 * 1000;
    private static final int MAX_VISITED = 400_000;
    private static final int PREVIEW_PER_FILTER = 20;

    private final ExecutorService executor = Executors.newSingleThreadExecutor();
    private final Object lock = new Object();
    private List<Match> lastMatches = new ArrayList<>();

    private static class Rule {
        String under;
        Set<String> exts;
        Pattern nameRegex;
        long minAgeDays;
        boolean emptyDirs;
        boolean anyFile;
    }

    private static class Filter {
        String id;
        List<Rule> rules = new ArrayList<>();
    }

    private static class Match {
        String filterId;
        File file;
        long size;
        long modified;
        boolean dir;
    }

    private static boolean isSupported() {
        return Build.VERSION.SDK_INT >= Build.VERSION_CODES.R;
    }

    private static boolean hasAccess() {
        return isSupported() && Environment.isExternalStorageManager();
    }

    @PluginMethod
    public void getAccessState(PluginCall call) {
        JSObject result = new JSObject();
        result.put("supported", isSupported());
        result.put("granted", hasAccess());
        call.resolve(result);
    }

    /** Ouvre l'écran système "Accès à tous les fichiers" ; rappeler getAccessState() au retour. */
    @PluginMethod
    public void openAccessSettings(PluginCall call) {
        if (!isSupported()) {
            call.reject("Android 11 ou plus récent requis");
            return;
        }
        Intent intent = new Intent(
            Settings.ACTION_MANAGE_APP_ALL_FILES_ACCESS_PERMISSION,
            Uri.parse("package:" + getContext().getPackageName())
        );
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        try {
            getContext().startActivity(intent);
            call.resolve();
        } catch (Exception e) {
            call.reject("Impossible d'ouvrir les réglages");
        }
    }

    @PluginMethod
    public void scan(PluginCall call) {
        if (!hasAccess()) {
            call.reject("Accès aux fichiers non accordé");
            return;
        }
        final List<Filter> filters;
        try {
            filters = parseFilters(call.getArray("filters"));
        } catch (JSONException | RuntimeException e) {
            call.reject("Filtres invalides");
            return;
        }
        executor.execute(() -> {
            try {
                File root = Environment.getExternalStorageDirectory().getCanonicalFile();
                List<Match> matches = new ArrayList<>();
                boolean[] truncated = new boolean[] { false };
                int[] visited = new int[] { 0 };
                walk(root, "", filters, matches, visited, truncated, System.currentTimeMillis());
                synchronized (lock) {
                    lastMatches = matches;
                }
                call.resolve(buildScanResult(filters, matches, truncated[0]));
            } catch (Exception e) {
                call.reject("Analyse impossible : " + e.getMessage());
            }
        });
    }

    /** Supprime ce que le dernier scan() a trouvé pour les filtres demandés (ids uniquement). */
    @PluginMethod
    public void deleteFilters(PluginCall call) {
        if (!hasAccess()) {
            call.reject("Accès aux fichiers non accordé");
            return;
        }
        JSArray idsArray = call.getArray("ids");
        if (idsArray == null) {
            call.reject("ids manquants");
            return;
        }
        final Set<String> ids = new HashSet<>();
        try {
            for (int i = 0; i < idsArray.length(); i++) ids.add(idsArray.getString(i));
        } catch (JSONException e) {
            call.reject("ids invalides");
            return;
        }
        executor.execute(() -> {
            List<Match> snapshot;
            synchronized (lock) {
                snapshot = new ArrayList<>(lastMatches);
            }
            File root;
            try {
                root = Environment.getExternalStorageDirectory().getCanonicalFile();
            } catch (IOException e) {
                call.reject("Stockage inaccessible");
                return;
            }
            long freed = 0;
            int deleted = 0;
            int failed = 0;
            List<Match> remaining = new ArrayList<>();
            for (Match m : snapshot) {
                if (!ids.contains(m.filterId)) {
                    remaining.add(m);
                    continue;
                }
                if (isSafeToDelete(m, root) && m.file.delete()) {
                    deleted++;
                    freed += m.size;
                } else {
                    failed++;
                }
            }
            synchronized (lock) {
                lastMatches = remaining;
            }
            JSObject result = new JSObject();
            result.put("deleted", deleted);
            result.put("failed", failed);
            result.put("freedBytes", freed);
            call.resolve(result);
        });
    }

    private static boolean isSafeToDelete(Match m, File root) {
        try {
            File f = m.file;
            if (!f.exists() || isSymlink(f)) return false;
            if (f.isDirectory() != m.dir) return false;
            // Modifié depuis le scan : l'utilisateur ne l'a pas vu dans cet état, on n'y touche pas.
            if (f.lastModified() != m.modified) return false;
            return f.getCanonicalPath().startsWith(root.getPath() + File.separator);
        } catch (IOException e) {
            return false;
        }
    }

    private static boolean isSymlink(File f) throws IOException {
        File parent = f.getParentFile();
        if (parent == null) return false;
        return !f.getCanonicalFile().equals(new File(parent.getCanonicalFile(), f.getName()));
    }

    private static boolean isProtectedDir(String relLower) {
        return relLower.equals("android/data") || relLower.startsWith("android/data/")
            || relLower.equals("android/obb") || relLower.startsWith("android/obb/");
    }

    /** @return true si le dossier est vide (avant tout nettoyage). */
    private boolean walk(File dir, String relPrefix, List<Filter> filters, List<Match> out,
                         int[] visited, boolean[] truncated, long now) throws IOException {
        File[] children = dir.listFiles();
        if (children == null) return false; // illisible : jamais considéré comme vide
        for (File child : children) {
            if (visited[0]++ >= MAX_VISITED) {
                truncated[0] = true;
                return false;
            }
            String rel = relPrefix.isEmpty() ? child.getName() : relPrefix + "/" + child.getName();
            String relLower = rel.toLowerCase(Locale.ROOT);
            if (isProtectedDir(relLower) || isSymlink(child)) continue;

            if (child.isDirectory()) {
                boolean empty = walk(child, rel, filters, out, visited, truncated, now);
                addIfMatching(filters, out, child, relLower, true, empty, now);
            } else {
                addIfMatching(filters, out, child, relLower, false, false, now);
            }
        }
        return children.length == 0;
    }

    private void addIfMatching(List<Filter> filters, List<Match> out, File file, String relLower,
                               boolean isDir, boolean isEmpty, long now) {
        long modified = file.lastModified();
        for (Filter filter : filters) {
            if (matches(filter, relLower, isDir, isEmpty, modified, now)) {
                Match m = new Match();
                m.filterId = filter.id;
                m.file = file;
                m.size = isDir ? 0 : file.length();
                m.modified = modified;
                m.dir = isDir;
                out.add(m);
                return; // un fichier n'est compté que dans le premier filtre qui le vise
            }
        }
    }

    private static boolean matches(Filter filter, String path, boolean isDir, boolean isEmpty,
                                   long modified, long now) {
        String name = path.substring(path.lastIndexOf('/') + 1);
        double ageDays = (now - modified) / (double) DAY_MS;
        for (Rule rule : filter.rules) {
            if (rule.emptyDirs) {
                if (!isDir || !isEmpty) continue;
            } else if (isDir) {
                continue;
            }
            if (rule.under != null) {
                if (!path.startsWith(rule.under)) continue;
            } else if (path.startsWith("android/")) {
                continue;
            }
            if (rule.exts != null) {
                int dot = name.lastIndexOf('.');
                String ext = (dot > 0 && dot < name.length() - 1) ? name.substring(dot + 1) : "";
                if (!rule.exts.contains(ext)) continue;
            }
            if (rule.nameRegex != null && !rule.nameRegex.matcher(name).find()) continue;
            if (rule.minAgeDays > 0 && ageDays < rule.minAgeDays) continue;
            if (!rule.emptyDirs && rule.exts == null && rule.nameRegex == null && !rule.anyFile) continue;
            return true;
        }
        return false;
    }

    private static List<Filter> parseFilters(JSArray array) throws JSONException {
        if (array == null) throw new JSONException("filters");
        List<Filter> filters = new ArrayList<>();
        for (int i = 0; i < array.length(); i++) {
            JSONObject fo = array.getJSONObject(i);
            Filter filter = new Filter();
            filter.id = fo.getString("id");
            JSONArray rules = fo.getJSONArray("rules");
            for (int j = 0; j < rules.length(); j++) {
                JSONObject ro = rules.getJSONObject(j);
                Rule rule = new Rule();
                rule.under = ro.has("under") ? ro.getString("under").toLowerCase(Locale.ROOT) : null;
                if (ro.has("exts")) {
                    rule.exts = new HashSet<>();
                    JSONArray exts = ro.getJSONArray("exts");
                    for (int k = 0; k < exts.length(); k++) rule.exts.add(exts.getString(k).toLowerCase(Locale.ROOT));
                }
                if (ro.has("nameRegex")) rule.nameRegex = Pattern.compile(ro.getString("nameRegex"));
                rule.minAgeDays = ro.optLong("minAgeDays", 0);
                rule.emptyDirs = ro.optBoolean("emptyDirs", false);
                rule.anyFile = ro.optBoolean("anyFile", false);
                filter.rules.add(rule);
            }
            filters.add(filter);
        }
        return filters;
    }

    private static JSObject buildScanResult(List<Filter> filters, List<Match> matches, boolean truncated) {
        JSArray results = new JSArray();
        for (Filter filter : filters) {
            long bytes = 0;
            int count = 0;
            JSArray preview = new JSArray();
            for (Match m : matches) {
                if (!m.filterId.equals(filter.id)) continue;
                count++;
                bytes += m.size;
                if (preview.length() < PREVIEW_PER_FILTER) preview.put(m.file.getName());
            }
            JSObject entry = new JSObject();
            entry.put("id", filter.id);
            entry.put("count", count);
            entry.put("bytes", bytes);
            entry.put("preview", preview);
            results.put(entry);
        }
        JSObject result = new JSObject();
        result.put("results", results);
        result.put("truncated", truncated);
        return result;
    }
}
