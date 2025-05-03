/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
    webpack(config, { isServer }) {
    // Ignore test files during build
    config.module.rules.push({
      test: /\.test\.(ts|tsx)$/,  // Regex to match .test.ts or .test.tsx files
      loader: 'ignore-loader',  // This will ignore these files
    });

    return config;
  },
};

export default config;
