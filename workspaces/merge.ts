import { ensureDir } from "https://deno.land/std@0.218.2/fs/ensure_dir.ts";
import * as path from "https://deno.land/std@0.218.2/path/mod.ts";

const inputDir = "input"; // JSONファイルが保存されているディレクトリ
const outputDir = "output"; // 出力するJSONファイルを保存するディレクトリ
const outputFile = "merged.json"; // マージ後のJSONファイル名

// ファイルを読み込み、JSONをパースする関数
const readAndParseJson = async (filePath: string): Promise<unknown> => {
	try {
		const fileContent = await Deno.readTextFile(filePath);
		return JSON.parse(fileContent);
	} catch (error) {
		console.error(`Error reading or parsing file: ${filePath}`, error);
		return null;
	}
};

const mergeJsons = (jsons: unknown[]): object => {
	return jsons.reduce((merged: Record<string, any>, current: unknown) => {
		if (current === null || current === undefined) {
			console.log("current is null or undefined");
			return merged;
		}

		if (typeof current !== "object" || Array.isArray(current)) {
			return merged; // current がオブジェクトでなければスキップ
		}

		if (typeof merged !== "object" || Array.isArray(merged)) {
			return current;
		}

		return { ...merged, ...current }; // オブジェクトの場合のみマージ
	}, {});
};

// 結果をファイルに保存する関数
const saveMergedJson = async (dir: string, fileName: string, data: unknown) => {
	const formattedData = JSON.stringify(data, null, 2);
	await ensureDir(dir);
	const fullFilePath = `${dir}/${fileName}`;
	await Deno.writeTextFile(fullFilePath, formattedData);
	console.log(`Merged JSON saved to ${fullFilePath}`);
};

const isJsonFile = (entry: Deno.DirEntry): boolean =>
	entry.isFile && entry.name.endsWith(".json");

const mapToPath =
	(dir: string) =>
	(entry: Deno.DirEntry): string =>
		path.join(dir, entry.name);

const getJsonFiles = (dir: string): Promise<string[]> => {
	const readDirEntries = async (dir: string): Promise<Deno.DirEntry[]> => {
		const entries = await Array.fromAsync(Deno.readDir(dir), (entry) => {
			console.log({ name: entry.name });
			return entry;
		});
		return entries;
	};

	return readDirEntries(dir).then((entries) =>
		entries.filter(isJsonFile).flatMap(mapToPath(dir)),
	);
};

// メインの処理を行う関数
const main = async () => {
	const dir = new URL(".", import.meta.url).pathname; // 現在のファイルが存在するディレクトリパスを取得

	const inputFullPath = `${dir}${inputDir}`;
	const outputFullPath = `${dir}${outputDir}`;
	const jsonFiles = await getJsonFiles(inputFullPath);

	if (jsonFiles.length === 0) {
		console.log("No JSON files found in input directory.");
		return;
	}

	const jsons = await Promise.all(jsonFiles.map(readAndParseJson));
	// console.log({ jsons });
	const mergedJson = mergeJsons(jsons);

	await saveMergedJson(outputFullPath, outputFile, mergedJson);
};

main();
