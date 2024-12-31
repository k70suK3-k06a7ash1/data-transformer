import { ensureDir } from "https://deno.land/std@0.218.2/fs/ensure_dir.ts";

const baseUrl =
  "https://datasets-server.huggingface.co/rows?dataset=AiresPucrs%2Fstanford-encyclopedia-philosophy&config=default&split=train";
const outputDirBase = 'input';
const fetchCount = 30;
const length = 100;


// fetchを行い、jsonを返す関数
const fetchData = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// JSONデータを整形する関数
const formatJson = (jsonData: unknown) => JSON.stringify(jsonData, null, 2);


// ファイルに保存する関数
const saveFile = async (dir: string, fileName: string, data: string) => {
    await ensureDir(dir);
    const fullFilePath = `${dir}/${fileName}`;
    await Deno.writeTextFile(fullFilePath, data);
    console.log(`Data saved to ${fullFilePath}`);
};

// データの取得、整形、保存処理をまとめる関数
const processData = async (offset: number, outputDir: string, fileIndex: number) => {
    const url = `${baseUrl}&offset=${offset}&length=${length}`;
    const fileName = `output_${fileIndex + 1}.json`;
    const jsonData = await fetchData(url);
    const formattedJson = formatJson(jsonData);
    await saveFile(outputDir, fileName, formattedJson);
};


// offset配列を生成する関数
const generateOffsets = (fetchCount: number, length: number) =>
  Array.from({ length: fetchCount }, (_, i) => i * length);


// メイン処理
const main = async () => {
    const dir = new URL('.', import.meta.url).pathname;
    const outputDir = `${dir}${outputDirBase}`;
    const offsets = generateOffsets(fetchCount, length);

    await Promise.all(offsets.map((offset, index) =>
            processData(offset, outputDir, index)
        )
    );
};


main();