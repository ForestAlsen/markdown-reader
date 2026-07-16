const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add support for .md files
config.resolver.sourceExts.push('md', 'txt', 'markdown');

// Polyfill Node's "punycode" module for React Native.
// markdown-it (used by react-native-markdown-display) imports "punycode"
// which is a Node built-in not available in the RN runtime.
const punycodePath = require.resolve('punycode/');

config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules || {}),
  punycode: punycodePath,
};

// Also intercept the bare specifier at the resolver level
const { resolveRequest: originalResolveRequest } = config.resolver;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Redirect bare "punycode" to the userland package
  if (moduleName === 'punycode') {
    return {
      filePath: punycodePath,
      type: 'sourceFile',
    };
  }
  // Fall back to the default resolver
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
