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

// New booking invoice
export const  createNewInvoice=async(bookingDetails)=>{
   return generateInvoice(bookingDetails);
}
// Update Existing invoice
export const updateInvoice=async (bookingDetails)=>{
  return generateInvoice(bookingDetails)
}
// extend booking
export const extendInvoice = async (bookingDetails) => {
  return generateInvoice(bookingDetails);
};

const generateInvoice = async (bookingDetails) => {
  const car = await Car.findById(bookingDetails.carId);
  const user = await User.findById(bookingDetails.userId);

  const invoicePath = path.join(invoicesDir, `invoice_${bookingDetails._id}.pdf`);

  if (fs.existsSync(invoicePath)) {
    fs.unlinkSync(invoicePath); // Purani invoice delete karo
  }

  const doc = new PDFDocument({ size: "A4", margin: 50 });
  doc.pipe(fs.createWriteStream(invoicePath));

  doc.rect(0, 0, 612, 100).fill("#4A90E2");
  doc.fillColor("white").fontSize(30).text("RentRush Invoice", 50, 40);
  doc.fillColor("white").fontSize(14).text(`Invoice Type: ${bookingDetails.invoiceType}`, 50, 70);

  doc.fillColor("black").fontSize(18).text("Invoice", 390, 40);
  doc.fontSize(11).text(`#${bookingDetails._id}`, 390, 55);
  doc.text(`Invoice Date: ${moment().format("MMMM Do YYYY")}`, 390, 65);
  doc.text(`Due Date: ${moment().add(1, "day").format("MMMM Do YYYY")}`, 390, 75);

  doc.fillColor("black").fontSize(14).text("Billed To:", 50, 150);
  doc.fontSize(12).text(`${user.ownerName}\n${user.email}\n${user.address}\n${user.contactNumber}`, 50, 170);
  
  doc.fontSize(14).text("From:", 350, 150);
  doc.fontSize(12).text("RentRush Inc.\nrentrush.com\n1234 Car Rental Avenue\n(+254) 123-456-789", 350, 170);

  doc.moveTo(50, 250).lineTo(550, 250).stroke();
  doc.fontSize(12)
    .text("Description", 50, 260)
    .text("Start Date & Time", 180, 260)
    .text("End Date & Time", 300, 260)
    .text("Daily Rent", 410, 260)
    .text("Amount", 480, 260);
  doc.moveTo(50, 280).lineTo(550, 280).stroke();

  // ✅ Table Data
  doc.fontSize(12)
    .text(`${car.carBrand} ${car.carModel} (${car.color})`, 50, 290)
    .text(`${moment(bookingDetails.rentalStartDate).format("YYYY-MM-DD")}`, 180, 290)
    .text(`${bookingDetails.rentalStartTime}`, 180, 305)
    .text(`${moment(bookingDetails.rentalEndDate).format("YYYY-MM-DD")}`, 300, 290)
    .text(`${bookingDetails.rentalEndTime}`, 300, 305)
    .text(`${car.rentRate.toFixed(0)} Rs`, 410, 290)
    .text(`${bookingDetails.totalPrice.toFixed(0)} Rs`, 480, 290);

  // ✅ Subtotal & Total
  const subtotal = bookingDetails.totalPrice;
  doc.moveTo(50, 320).lineTo(550, 320).stroke();
  doc.fontSize(12).text("Subtotal", 410, 330).text(`${subtotal.toFixed(0)} Rs`, 480, 330);

  // ✅ Footer
  doc.moveTo(50, 500).lineTo(550, 500).stroke();
  doc.fontSize(10).fillColor("gray").text("Thank you for choosing RentRush!", 50, 520, { align: "center" });

  doc.end();
  console.log(`Invoice saved at: ${invoicePath}`);
  return invoicePath;
};

