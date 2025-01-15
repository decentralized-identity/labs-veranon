import { File, Directory, Paths } from 'expo-file-system/next';

const BASE_URL = 'https://snark-artifacts.pse.dev';
const PROJECT = 'semaphore';

interface ArtifactOptions {
    version?: string;
    parameters?: (string | number)[];
}

interface SnarkArtifacts {
    wasm: string;
    zkey: string;
}

async function getArtifactUrls(options: ArtifactOptions = {}): Promise<SnarkArtifacts> {
    options.version ??= 'latest';
    const baseUrl = `${BASE_URL}/${PROJECT}/${options.version}/${PROJECT}`;
    const parameters = options.parameters
        ? `-${options.parameters.join('-')}`
        : '';

    return {
        wasm: `${baseUrl}${parameters}.wasm`,
        zkey: `${baseUrl}${parameters}.zkey`
    };
}

async function downloadArtifact(url: string, outputPath: File): Promise<void> {
    try {
        if (!outputPath.exists) {
            outputPath.parentDirectory.create();
            await File.downloadFileAsync(url, outputPath);
        }
    } catch (error) {
        console.error(`Failed to download artifact from ${url}:`, error);
        throw error;
    }
}

export async function maybeGetSnarkArtifacts(
    options: ArtifactOptions = {}
): Promise<SnarkArtifacts> {
    const urls = await getArtifactUrls(options);
    
    // Create artifacts directory in app's cache
    const artifactsDir = new Directory(Paths.cache, 'snark-artifacts');
    if (!artifactsDir.exists) {
        artifactsDir.create();
    }

    // Extract filenames from URLs
    const wasmFile = new File(artifactsDir, urls.wasm.split('/').pop()!);
    const zkeyFile = new File(artifactsDir, urls.zkey.split('/').pop()!);

    // Download artifacts if they don't exist
    await Promise.all([
        downloadArtifact(urls.wasm, wasmFile),
        downloadArtifact(urls.zkey, zkeyFile)
    ]);

    return {
        wasm: wasmFile.uri,
        zkey: zkeyFile.uri
    };
}