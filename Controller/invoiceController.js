import fs from "fs";
import path from "path";
import { PDFDocument as PDFLibDocument, rgb } from "pdf-lib";
import { fileURLToPath } from "url";
import Car from "../Model/Car.js";
import User from "../Model/signup.js";
import moment from "moment";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const invoicesDir = path.join(__dirname, "../invoices");

export const generateInvoice = async (bookingDetails) => {
  const user = await User.findById(bookingDetails.userId);
  const showroom = await User.findById(bookingDetails.showroomId);
  const car = bookingDetails.carId
    ? await Car.findById(bookingDetails.carId)
    : null;
  const invoiceName = `invoice_${bookingDetails._id}_${Date.now()}.pdf`
  const invoicePath = path.join(
    invoicesDir,
    invoiceName
  );

  const pdfDoc = await PDFLibDocument.create();
  const page = pdfDoc.addPage([600, 500]);
  const { height } = page.getSize();
  let y = height - 40;

  const drawText = (text, x, y, size = 12, color = rgb(0, 0, 0)) => {
    page.drawText(text, { x, y, size, color });
  };

  // Header
  page.drawRectangle({
    x: 0,
    y: height - 100,
    width: 600,
    height: 100,
    color: rgb(0.29, 0.56, 0.89),
  });

  drawText("RentRush Invoice", 50, y, 30, rgb(1, 1, 1));
  y -= 30;
  drawText(
    `Invoice Type: ${bookingDetails.invoiceType || "General"}`,
    50,
    y,
    14,
    rgb(1, 1, 1)
  );
  drawText(`Invoice #: ${bookingDetails._id}`, 400, height - 40, 12);
  drawText(`Date: ${moment().format("MMM Do YYYY")}`, 400, height - 60, 12);

  // Parties
  y -= 70;
  drawText("Billed To:", 50, y, 14);
  drawText(
    `${user?.ownerName || ""}\n${user?.email || ""}\n${user?.address || ""}\n${
      user?.contactNumber || ""
    }`,
    50,
    y - 20
  );
  drawText("From:", 350, y, 14);
  drawText(
    `${showroom?.showroomName || ""}\n${showroom?.email || ""}\n${
      showroom?.address || ""
    }\n${showroom?.contactNumber || ""}`,
    350,
    y - 20
  );

  y -= 110;

  // Table Headers
  page.drawLine({ start: { x: 50, y }, end: { x: 550, y }, thickness: 1 });
  y -= 20;
  drawText("Description", 50, y);
  drawText("Start Date", 180, y);
  drawText("End Date", 300, y);
  drawText("Daily Rent", 410, y);
  drawText("Amount", 480, y);
  y -= 10;
  page.drawLine({ start: { x: 50, y }, end: { x: 550, y }, thickness: 1 });

  y -= 20;

  let maintenanceTotal = 0;
  let rentalTotal = bookingDetails.totalPrice || 0;

  if (car) {
    drawText(`${car.carBrand} ${car.carModel} (${car.color})`, 50, y);
    drawText(
      moment(bookingDetails.rentalStartDate).format("YYYY-MM-DD"),
      180,
      y
    );
    drawText(moment(bookingDetails.rentalEndDate).format("YYYY-MM-DD"), 300, y);
    drawText(`${car.rentRate.toFixed(0)} Rs`, 410, y);
    drawText(`${rentalTotal.toFixed(0)} Rs`, 480, y);
    y -= 20;
  }

  if (
    bookingDetails.maintenanceCost &&
    typeof bookingDetails.maintenanceCost === "object"
  ) {
    const maintenanceEntries = Object.entries(bookingDetails.maintenanceCost);
    for (const [item, cost] of maintenanceEntries) {
      const costNumber = parseFloat(cost);
      if (!isNaN(costNumber)) {
        drawText(`Maintenance - ${item}`, 50, y);
        drawText("-", 180, y);
        drawText("-", 300, y);
        drawText("-", 410, y);
        drawText(`${costNumber.toFixed(0)} Rs`, 480, y);
        maintenanceTotal += costNumber;
        y -= 20;
      }
    }
  }

  const totalAmount = rentalTotal + maintenanceTotal;

  page.drawLine({ start: { x: 50, y }, end: { x: 550, y }, thickness: 1 });
  y -= 20;
  drawText("Total", 410, y);
  drawText(`${totalAmount.toFixed(0)} Rs`, 480, y);

  // Footer
  y -= 40;
  page.drawLine({ start: { x: 50, y }, end: { x: 550, y }, thickness: 1 });
  y -= 20;
  drawText("Thank you for choosing RentRush!", 50, y, 10, rgb(0.5, 0.5, 0.5));

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(invoicePath, pdfBytes);
  console.log("Invoice created successfully at:", invoicePath);

  return {invoicePath, invoiceName};
};
