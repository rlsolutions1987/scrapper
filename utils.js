import fs from "fs";
import { parse } from "csv-parse";
import getStream from "get-stream";
import { stringify } from "csv-stringify";
import { baseURL } from "./config.js";

// to read the file
export const readFile = async (filePath) => {
  const parseStream = parse({
    relax_column_count: true,
    delimiter: ",",
  });
  const data = await getStream.array(
    fs.createReadStream(filePath).pipe(parseStream)
  );
  return data.map((d) => d);
};
//  to download the file
export const downloadFile = (
  data = [],
  filename = outputFileName,
  columns = headerColumns
) => {
  try {
    stringify(data, { header: true, columns }, (err, output) => {
      if (err) throw err;
      fs.writeFileSync(filename, output, (err) => {
        if (err) throw err;
        console.log("file saved.");
      });
    });
  } catch (error) {
    console.log(error, "err");
  }
  return false;
};

export const getURL = (slug) => {
  slug = slug || ''
  return `${baseURL}${slug}`;
};
