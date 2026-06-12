// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Stub missing files referenced by App.tsx. When LoginScreen.tsx (or any
// screen) imports the apiClient, Metro will resolve it to our stub so the
// screen can render without a real backend.
config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules || {}),
};

// Re-alias the bare "apiClient" path used by LoginScreen.tsx
// (../api/apiClient resolves to src/app/api/apiClient).
// We do this with a resolver hook rather than a file-system symlink so the
// stub stays inside the source tree.
const path = require('path');
const fs = require('fs');

const originalResolve = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Map any "*/api/apiClient" import to the stub file
  if (moduleName.endsWith('/api/apiClient') || moduleName === 'apiClient') {
    const stub = path.join(context.projectRoot, 'src/app/api/apiClient.stub.ts');
    if (fs.existsSync(stub)) {
      return { type: 'sourceFile', filePath: stub };
    }
  }
  if (originalResolve) {
    return originalResolve(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
