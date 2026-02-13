import { Client } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const appsToFix = [
  { id: "app_1770825768298_s5kuh23rn", name: "Android Accessibility Suite", icon: "https://play-lh.googleusercontent.com/xBFTJQCPqUh0i97AwiPo-tPBndyn9GWwAqeoxPgKEPLdFcCaRsqcBpr6SC4uYgJ6Ew", package: "com.google.android.marvin.talkback" },
  { id: "app_1770825788594_sat7dxsru", name: "Canva", icon: "https://play-lh.googleusercontent.com/tUZNUbnNGw8I6uLg8Zy2ZWbmSFuT5kK0dYA8tdqNmldlozNS_jSjDw5j2nElRsoTzQ", package: "com.canva.editor" },
  { id: "app_1770825766513_rwna8fr8d", name: "Cleanup", icon: "https://play-lh.googleusercontent.com/ch_hRY59cDYlQrI-Utveqytsnu3rsMbhWeZWnX8AFLj4nW-CqA0BGl8EFxkk4Lz8DzEorfag343uFRgVPWCQ", package: "com.storage.androidcleaner" },
  { id: "app_1770825797286_1ftis86ag", name: "Collage Maker", icon: "https://play-lh.googleusercontent.com/ESTjkU8UqzM0FE0wKykfY51WEGpZZV1h6Vltgy9Z2bzrDaLA_MIyX85IpCHLb2_7-_U", package: "photoeditor.layout.collagemaker" },
  { id: "app_1770825773593_ckjlu9lx8", name: "DuckDuckGo", icon: "https://play-lh.googleusercontent.com/NW2ASwJ4qtxfThhVIpm4641sR4o-yGv80yqaJnOnpC4lEmdxEcNTFcF6-TlZYtmdaA", package: "com.duckduckgo.mobile.android" },
  { id: "app_1770825799343_u1klsdm6y", name: "eBay", icon: "https://play-lh.googleusercontent.com/31-mJUIynIfQBizOn-w1yWLKHBxVeRKA3gz348_E3K-TnuEaqCjn_-Fr9j0yQ6i0y5E", package: "com.ebay.mobile" },
  { id: "app_1770825799674_jz2mxml77", name: "Etsy", icon: "https://play-lh.googleusercontent.com/QjuCfvGNr91o5Do9OyNjBprY12cNi4d-uAm73zlHucElV306V5S2Rl1g02kqsXcDqA9XFYIeOD-LI0rdiJk_", package: "com.etsy.android" },
  { id: "app_1770825794769_otx1mawp9", name: "FaceApp", icon: "https://play-lh.googleusercontent.com/wy7PeVendA2m-DZnkSZepPYA9BaYydp35NhUwiw-BWkqh7BwvTAYMnlox118MmE2mQ", package: "io.faceapp" },
  { id: "app_1770825785870_k3jply57a", name: "HD Video Player", icon: "https://play-lh.googleusercontent.com/3XRmBa9MB3BUwZfF57ycUls3X-Cz0M4dtSrxcji9nEXORz5xPJtwOnCpsxlvltX67oQ", package: "com.rocks.music.videoplayer" },
  { id: "app_1770825763426_kj80eucbz", name: "Journal it!", icon: "https://play-lh.googleusercontent.com/ywZxG3YRI8dhRymmtqE1tsK1TKM5erN0wNoqnPqM16MLBOnszdZx7YwVit53vsG3K5cMqQ96xDgeEfDVuDiKsA", package: "org.de_studio.diary" },
  { id: "app_1770825784871_6q4ultwth", name: "KMPlayer", icon: "https://play-lh.googleusercontent.com/c50C3ph3Sm4u4NtSzp1f5dp4_-8KOy-Xj0fMKnI9noJ5Q0s9XKzElgDXgMZ-_5Il7Usq", package: "com.kmplayer" },
  { id: "app_1770825790807_37k17ubzi", name: "Lightroom", icon: "https://play-lh.googleusercontent.com/ALv_YzwUQTXc17qvu2oy7JTl8Qn-zm22M4FoZKVv2Ru541nDa2EltKPSlv_KyQGacLdpHLotR9Z98bamyEd9rKc", package: "com.adobe.lrmobile" },
  { id: "app_1770825752242_2aqqkshm6", name: "OK", icon: "https://play-lh.googleusercontent.com/n5IlYt9jRkNe3cA_aFq42plGz9BP1oH9tvh_LHi4w7s5BZhN_yzrio9jubsR3Jpqqk5a", package: "ru.ok.android" },
  { id: "app_1770825772357_5krpdcgab", name: "Opera", icon: "https://play-lh.googleusercontent.com/arHjD1CpUMbdhSFv5FXN2ckVcYMD4_49Mv80TBDx1YLKLZ36g4MM07zz8Q3r2Eyi2pd2", package: "com.opera.browser" },
  { id: "app_1770825789437_z2u9netcl", name: "Picsart", icon: "https://play-lh.googleusercontent.com/XqT9IqLdpcfqQ9OnfK8cfZ18wms1QKnRxG_IQPVnmUuHd3oih99H8w3H3F1EVD3KjII", package: "com.picsart.studio" },
  { id: "app_1770825783371_4ioydfgzx", name: "PlutoTV", icon: "https://play-lh.googleusercontent.com/O6MtMEvYNmr-I_cntqWT2Lq8L5Y5bG01V5udGLT8-8LcpNzeeOCDjgaX-mQEushfwrLjT74nVJMlmSgeIxtP", package: "tv.pluto.android" },
  { id: "app_1770825774531_0sclqh3zb", name: "PolyBuzz", icon: "https://play-lh.googleusercontent.com/0pUnIxdTlfubi7Qy2ca1kMHCoA2qn6AF4zRRLgna01jPKuVJgwddW8sKpebeKoJkQFM", package: "ai.socialapps.speakmaster" },
  { id: "app_1770825790189_kf5kiop65", name: "Remini", icon: "https://play-lh.googleusercontent.com/XJ6_UDSJx-QHQreBmIro5VMRJ--42F1XY3QphSYkeSRZdAUA0o_Y-EydVdK-NZOh", package: "com.bigwinepot.nwdn.international" },
  { id: "app_1770825777784_igzxc49jf", name: "Sony LIV", icon: "https://play-lh.googleusercontent.com/QtxELma_6y1jezI8QKqVtI8Tb0flMhPjIAzU-VSZ2jz7RwriCENXQk4M6MvUyVi5qg", package: "com.sonyliv" },
  { id: "app_1770825800745_u1t52eytd", name: "Temu", icon: "https://play-lh.googleusercontent.com/Nz5sdWyh7jn4eTy_GSaRBDgaKhLC1pvYywC6fklDOlPGbopmeFN9NkqgKGjsvJMbKVEI", package: "com.einnovation.temu" },
  { id: "app_1770825749376_nq2d6dajv", name: "Truecaller", icon: "https://play-lh.googleusercontent.com/qtgLcbI3f7CHcg8vUjYQQv3jzJ05-prQ5wr6VN0F-ehAFqLEjNNhFD_QbjujOAy-r4w", package: "com.truecaller" },
  { id: "app_1770825775219_um0hhlzj1", name: "Tubi", icon: "https://play-lh.googleusercontent.com/3nVkWPn19cL1C1LZ8AXEtS8z3VxoWc4SIlIN75sc437oM_9hVL1vhKpAGdUtVIPLj9o", package: "com.tubitv" },
  { id: "app_1770825753160_bcl5fsqg3", name: "Tumblr", icon: "https://play-lh.googleusercontent.com/cQuxmGMz2x7bY9217kl65c5S3SSeGVHnCJyAq6aogWLFWGkiCXo-qvKIpIe6c3h_9Col", package: "com.tumblr" },
  { id: "app_1770825755663_0e4bvgjan", name: "Twitch", icon: "https://play-lh.googleusercontent.com/Y6epalNGUKPgWyQpDCgVL621EgmOmXBWfQoJdaM8v0irKWEII5bEDvpaWp7Mey2MVg", package: "tv.twitch.android.app" },
  { id: "app_1770825786172_i55nhla55", name: "Video Player All Format", icon: "https://play-lh.googleusercontent.com/EYpaQSLn2UpiVWhSIISiy2xapya2vVJvYNaKgOKy6Tr5o3QZG7GSaW4azVsFj6Ce7jY", package: "video.player.videoplayer" },
  { id: "app_1770825784570_ztlvsya2t", name: "Video Player All Format", icon: "https://play-lh.googleusercontent.com/EYpaQSLn2UpiVWhSIISiy2xapya2vVJvYNaKgOKy6Tr5o3QZG7GSaW4azVsFj6Ce7jY", package: "video.player.videoplayer" },
  { id: "app_1770825785238_rh822qez0", name: "Video Player All Format", icon: "https://play-lh.googleusercontent.com/EYpaQSLn2UpiVWhSIISiy2xapya2vVJvYNaKgOKy6Tr5o3QZG7GSaW4azVsFj6Ce7jY", package: "video.player.videoplayer" },
  { id: "app_1770825805084_f3hdd5iu5", name: "Wayfair", icon: "https://play-lh.googleusercontent.com/YEkfHyo5JHEV7YKYnjnZM18V4XboWzh1MFFC6D8RqhwIOtV5g2Yz7NWTabiMV8PXxVE", package: "com.wayfair.wayfair" },
  { id: "app_1770825801408_he7rh00kb", name: "Wish", icon: "https://play-lh.googleusercontent.com/IQKc-fF8iDPysSuc9EssDW84qXGsLsO3W4aTCmBnavjAFJqo2z6KXe9_xZOoMm5Q6JnoNKmW49ZgszrtLtgR", package: "com.contextlogic.wish" }
];

async function fixBulkIcons() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('🔌 Connecté à la base de données Neon\n');

    let successCount = 0;
    let failCount = 0;

    for (const app of appsToFix) {
      console.log(`\n📱 ${app.name}`);
      console.log(`   ID: ${app.id}`);
      console.log(`   Package: ${app.package}`);
      
      try {
        const result = await client.query(
          'UPDATE applications SET icon = $1, play_store_url = $2 WHERE id = $3 RETURNING name',
          [app.icon, app.package, app.id]
        );

        if (result.rowCount > 0) {
          console.log(`   ✅ Icône mise à jour avec succès`);
          successCount++;
        } else {
          console.log(`   ⚠️  App non trouvée dans la base`);
          failCount++;
        }
      } catch (error) {
        console.log(`   ❌ Erreur: ${error.message}`);
        failCount++;
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log(`\n📊 Résumé:`);
    console.log(`   ✅ Succès: ${successCount}/${appsToFix.length}`);
    console.log(`   ❌ Échecs: ${failCount}/${appsToFix.length}`);
    console.log(`   📈 Taux de réussite: ${((successCount / appsToFix.length) * 100).toFixed(1)}%`);

  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
  } finally {
    await client.end();
    console.log('\n🔌 Déconnexion de la base de données');
  }
}

fixBulkIcons();
