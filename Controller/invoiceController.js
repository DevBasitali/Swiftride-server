import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import { fileURLToPath } from "url";
import Car from "../Model/Car.js";
import User from "../Model/signup.js";
import moment from "moment";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const invoicesDir = path.join(__dirname, "../invoices");

export const createInvoice = async (bookingDetails) => {
  const car = await Car.findById(bookingDetails.carId);
  const user = await User.findById(bookingDetails.userId);

  if (!fs.existsSync(invoicesDir)) {
    fs.mkdirSync(invoicesDir, { recursive: true });
  }

  const doc = new PDFDocument({ size: "A4", margin: 50 });
  const invoicePath = path.join(invoicesDir, `invoice_${bookingDetails._id}.pdf`);
  doc.pipe(fs.createWriteStream(invoicePath));

  // Header Section
  doc.rect(0, 0, 612, 100).fill("#4A90E2");
  doc.fillColor("white").fontSize(30).text("RentRush Invoice", 50, 40);

  // Invoice Details
  doc.fillColor("black").fontSize(18).text("Invoice", 380, 40);
  doc.fontSize(12).text(`#${bookingDetails._id}`, 380, 55);
  doc.text(`Invoice Date: ${moment().format("MMMM Do YYYY")}`, 380, 70);
  doc.text(`Due Date: ${moment().add(1, "day").format("MMMM Do YYYY")}`, 380, 85);

  // Billing Information
  doc.fillColor("black").fontSize(14).text("Billed To:", 50, 150);
  doc.fontSize(12).text(`${user.ownerName}\n${user.email}\n${user.address}\n${user.contactNumber}`, 50, 170);
  
  doc.fontSize(14).text("From:", 350, 150);
  doc.fontSize(12).text("RentRush Inc.\nrentrush.com\n1234 Car Rental Avenue\n(+254) 123-456-789", 350, 170);

  // Table Headers
  doc.moveTo(50, 250).lineTo(550, 250).stroke();
  doc.fontSize(12).text("Description", 50, 260).text("Date", 200, 260).text("Daily Rent", 350, 260).text("Amount", 450, 260);
  doc.moveTo(50, 280).lineTo(550, 280).stroke();

  // Table Data
  doc.fontSize(12)
    .text(`${car.carBrand} ${car.carModel} (${car.color})`, 50, 290)
    .text(`${moment(bookingDetails.rentalStartDate).format("YYYY-MM-DD")} ${bookingDetails.rentalStartTime}`, 200, 290)
    .text(`${car.rentRate.toFixed(2)} Rs`, 350, 290)
    .text(`${bookingDetails.totalPrice.toFixed(2)} Rs`, 450, 290);
  
  // Subtotal & Total
  const subtotal = bookingDetails.totalPrice;
  doc.moveTo(50, 320).lineTo(550, 320).stroke();
  doc.fontSize(12).text("Subtotal", 350, 330).text(`${subtotal.toFixed(2)} Rs`, 450, 330);

  // Footer
  doc.moveTo(50, 500).lineTo(550, 500).stroke();
  doc.fontSize(10).fillColor("gray").text("Thank you for choosing RentRush!", 50, 520, { align: "center" });
  doc.end();
  console.log(`Invoice saved at: ${invoicePath}`);
  return invoicePath;
};
