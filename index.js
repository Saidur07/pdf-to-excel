const express = require("express");
const multer = require("multer");
const pdfImage = require("pdf-image").PDFImage;
const pdfTableExtractor = require("pdf-table-extractor");
const excel = require("exceljs");
const Tesseract = require("tesseract.js");
const fs = require("fs");
const app = express();

const upload = multer();

app.post("/upload", upload.single("pdf"), async (req, res) => {
  if (fs.existsSync(req.file.path)) {
    const pdf = new pdfImage(req.file.path);
    await pdf.convertFile().then(async function (imagePaths) {
      // Extract tables from images
      imagePaths.forEach(async (imagePath) => {
        await pdfTableExtractor(imagePath)
          .then((tablesAsJson) => {
            // Create a new Excel workbook
            const workbook = new excel.Workbook();
            const worksheet = workbook.addWorksheet("Tables");

            // Add the tables to the worksheet
            tablesAsJson.forEach((table) => {
              worksheet.addRows(table);
            });
            // OCR
            Tesseract.recognize(imagePath, { lang: "eng+urd" })
              .progress(function (p) {
                console.log("progress", p);
              })
              .catch((err) => console.error(err))
              .then(function (result) {
                console.log(result.text);
              });
            // Send the Excel file to the client
            res.setHeader(
              "Content-Type",
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            );
            res.setHeader(
              "Content-Disposition",
              "attachment; filename=tables.xlsx"
            );
            return workbook.xlsx.write(res);
          })
          .catch((err) => {
            console.log(err);
          });
      });
    });
  } else {
    console.log("File not found");
  }
});

app.listen(3000, () => {
  console.log("Server listening on port 3000");
});
