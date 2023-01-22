const express = require("express");
const fileUpload = require("express-fileupload");
const exec = require("child_process").exec;
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
    exec(`pdftotext -layout /tmp/${fileName}.pdf -`, (err, stdout) => {
      if (err) {
        return res.status(500).send({ error: err });
      }
      // parse the plain text here
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );

      // convert plain text to excel here
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=" + fileName + ".xlsx"
      );
      res.send(excelFile);
    });
  });
});
const port = 3000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
