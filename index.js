const express = require("express");
const multer = require("multer");
const PDFImage = require("pdf-image").PDFImage;
const Tesseract = require("tesseract.js");
const Excel = require("exceljs");
const pdf2excel = require("pdf-to-excel");
const fs = require("fs");
const path = require("path");

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
  const newFilePath = `generated/${Math.round(Math.random() * 1000000)}.xlsx`
  try {
    const options = {
      onProcess: (e) => console.warn(`${e.numPage} / ${e.numPages}`),
      start: 1,
    }
    await pdf2excel.genXlsx(req.file.path, newFilePath, options)
    console.log("Excel file created successfully");
    res.status(200).sendFile(newFilePath, {
      root: path.join(__dirname)
    })
  } catch {
    res.status(500).send("Error");
  }
});

app.listen(3000, () => {
  console.log("Server listening on port 3000");
});


        // const pdfImage = new PDFImage(req.file.path);
      // // convert the first page of the pdf to an image
      // pdfImage.convertPage(0).then(async (imagePath) => {
      //   // Recognize text from pdf file

      //   const {
      //     data: { text },
      //   } = await Tesseract.recognize(imagePath, "eng", {
      //     tessjs_create_pdf: "1",
      //   });
      //   console.log(data);
      //   // Create a new excel workbook
      //   const workbook = new Excel.Workbook();
      //   const worksheet = workbook.addWorksheet("Table Data");
      //   // Add the text to the worksheet
      //   worksheet.addRow([text]);
      //   // Set the response headers
      //   res.setHeader(
      //     "Content-Type",
      //     "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      //   );
      //   res.setHeader(
      //     "Content-Disposition",
      //     "attachment; filename=" + "table_data.xlsx"
      //   );
      //   // Write the excel data to the response and send it to the client
      //   workbook.xlsx.write(res).then(() => {
      //     console.log("Excel file created successfully");
      //     res
      //       .status(200)
      //       .send("PDF text extracted and excel file created successfully");
      //   });
      // });