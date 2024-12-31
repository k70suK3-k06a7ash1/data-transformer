import { ensureDir } from "https://deno.land/std@0.218.2/fs/ensure_dir.ts";

const baseUrl =
  "https://datasets-server.huggingface.co/rows?dataset=AiresPucrs%2Fstanford-encyclopedia-philosophy&config=default&split=train";
const outputDirBase = 'output'; // ディレクトリ名を共通化

const fetchCount = 10; // 取得する回数
const length = 100;    // 各回で取得するデータ件数

async function fetchAndSave(offset: number, outputFileName: string) {
    const url = `${baseUrl}&offset=${offset}&length=${length}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const jsonData = await response.json();

    // JSONデータを整形して保存する（必要に応じて）
    const formattedJson = JSON.stringify(jsonData, null, 2);

    // ディレクトリの存在をチェックし、必要なら作成
    const dir = new URL('.', import.meta.url).pathname; // 現在のファイルが存在するディレクトリパスを取得
    const outputDir = `${dir}${outputDirBase}`;
    await ensureDir(outputDir);
    
    const fullFilePath = `${outputDir}/${outputFileName}`;

    await Deno.writeTextFile(fullFilePath, formattedJson);
    console.log(`Data saved to ${fullFilePath}`);
  } catch (error) {
    console.error("Error fetching or saving data:", error);
  }
}


async function main() {
    for (let i = 0; i < fetchCount; i++) {
      const offset = i * length;
      const outputFileName = `output_${i + 1}.json`;
      await fetchAndSave(offset, outputFileName);
    }
  }


main();