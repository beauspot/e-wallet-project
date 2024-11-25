import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default async () => {
    const tsconfigPaths = await import('vite-tsconfig-paths').then(mod => mod.default);

    return {
        plugins: [tsconfigPaths()],
        test: {
            globals: true,
            environment: 'node',
            include: ["./src/__tests__/*.test.ts", "./src/__tests__/*spec.ts"],
            setupFiles: ['./src/__tests__/setup.ts']
        },
    };
};