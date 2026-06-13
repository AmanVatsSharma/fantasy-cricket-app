// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Alias the apiClient import to our stub. We do this with a resolver hook
// (instead of a file-system symlink) so the stub lives inside the source
// tree and Metro can serve it through its normal module pipeline.
//
// IMPORTANT: Expo's `withMetroResolvers` wraps the resolver chain and the
// `context` object it passes does NOT include `projectRoot`. We must use
// the cwd of the metro process (i.e. the directory metro.config.js lives in)
// as the project root.
const projectRoot = __dirname;

// Keep a reference to Expo's default resolver so we delegate when the
// import isn't ours.
const expoResolver = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Match both `.../api/apiClient` (from store files: `../api/apiClient`)
  // and the bare `apiClient` (in case anyone imports it that way).
  if (
    typeof moduleName === 'string' &&
    (moduleName === 'apiClient' || /\/api\/apiClient$/.test(moduleName))
  ) {
    const stub = path.join(projectRoot, 'src', 'app', 'api', 'apiClient.stub.ts');
    return { type: 'sourceFile', filePath: stub };
  }

  if (expoResolver) {
    return expoResolver(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
