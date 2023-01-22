const express = require("express");
const fileUpload = require("express-fileupload");
const pdfTableExtractor = require("pdf-table-extractor");
const excel = require("exceljs");

const app = express();
app.use(express.json());
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
app.post("/upload", (req, res) => {
  if (!req.files) {
    return res.status(400).send({ error: "No files were uploaded." });
  }

  let pdfFile = req.files.pdfFile;
  let fileName = pdfFile.name.split(".")[0];

  pdfFile.mv(`/tmp/${fileName}.pdf`, (err) => {
    if (err) {
      return res.status(500).send({ error: err });
    }
    pdfTableExtractor(`/tmp/${fileName}.pdf`, (err, tables) => {
      if (err) {
        return res.status(500).send({ error: err });
      }
      let workbook = new excel.Workbook();
      let worksheet = workbook.addWorksheet("Sheet1");
      tables.forEach((table) => {
        let data = table.rows.map((row) => row.map((cell) => cell.text));
        worksheet.addRows(data);
      });
      workbook.xlsx.writeFile(`/tmp/${fileName}.xlsx`).then(() => {
        res.download(`/tmp/${fileName}.xlsx`, `${fileName}.xlsx`, (err) => {
          if (err) {
            return res.status(500).send({ error: err });
          }
        });
      });
    });
  });
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
