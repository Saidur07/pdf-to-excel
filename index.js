const express = require("express");
const multer = require("multer");
const PDFImage = require("pdf-image").PDFImage;
const Tesseract = require("tesseract.js");
const Excel = require("exceljs");

const app = express();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });

app.post("/upload", upload.single("pdfFile"), async (req, res) => {
  const pdfImage = new PDFImage(req.file.path);
  // convert the first page of the pdf to an image
  pdfImage.convertPage(0).then(async (imagePath) => {
    // Recognize text from pdf file

    let text = "";
    for (let i = 0; i < res.length; i++) {
      const image = res[i];
      const imageText = await Tesseract.recognize(image, {
        lang: "urd+eng",
      });
      text += imageText;
    }
    const lines = text.split("\n");
    const workbook = new Excel.Workbook();
    const sheet = workbook.addWorksheet("Sheet 1");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.length === 0) continue;
      const row = line.split(" ");
      sheet.addRow(row);
    }
    // Save the workbook to a file
    workbook.xlsx.writeFile(`table.xlsx`).then(() => {
      res.setHeader("Content-Disposition", "attachment; filename=table.xlsx");
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.sendFile(table.xlsx, { root: "./" });
    });
    /*   const {
      data: { text },
    } = await Tesseract.recognize(imagePath, "eng", {
      tessjs_create_pdf: "1",
    });
    // Create a new excel workbook
    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet("Table Data");
    // Add the text to the worksheet
    worksheet.addRow([text]);
    // Set the response headers
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=" + "table_data.xlsx"
    ); */
    // Write the excel data to the response and send it to the client
    // workbook.xlsx.write(res).then(() => {
    //   res
    //     .status(200)
    //     .send("PDF text extracted and excel file created successfully");
    // });
  });
});

app.listen(3000, () => {
  console.log("Server listening on port 3000");
});
