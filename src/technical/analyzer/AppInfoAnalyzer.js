import { createApplicationInfo } from '../model/ApplicationInfo.js';

/**
 * Normalise les infos générales brutes d'une RawPackageData en ApplicationInfo.
 * @param {import('../source/RawPackageData').RawPackageData} rawData
 * @returns {import('../model/ApplicationInfo').ApplicationInfo}
 */
export function analyzeAppInfo(rawData) {
  return createApplicationInfo({
    packageName: rawData.packageName,
    ...rawData.appInfo,
  });
}

export default analyzeAppInfo;
