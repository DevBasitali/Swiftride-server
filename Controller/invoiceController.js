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
  const invoicePath = path.join(
    invoicesDir,
    `invoice_${bookingDetails._id}.pdf`
  );
  doc.pipe(fs.createWriteStream(invoicePath));

  doc.fontSize(40).fillColor("black").text("RentRush Invoice", 50, 80);

  doc.circle(60, 140, 12).fillColor("green").fill();
  doc
    .fontSize(14)
    .fillColor("white")
    .text("Live", 50, 135, { align: "center", width: 20 });

  doc.fontSize(18).fillColor("black").text("Invoice", 350, 80);
  doc.fontSize(12).text(`#${bookingDetails._id}`, 350, 100);
   doc.text(`Invoice Date: ${moment().format('MMMM Do YYYY')}`, 350, 120);
   doc.text(`Due Date: ${moment().add(1, 'day').format('MMMM Do YYYY')}`, 350, 135);

  // Billed To and From Details
  doc
    .moveDown()
    .text("Billed To", 50, 220)
    .text(
      `${user.ownerName}\n${user.email}\n${user.address}\n${user.contactNumber}`,
      50,
      240
    );

  doc
    .text("From", 350, 220)
    .text(
      "RentRush Inc.\n rentrush.com\n 1234 Car Rental Avenue\n (+254) 123-456-789",
      350,
      240
    );

  // Invoice Description Table Header
  doc.moveTo(50, 320).lineTo(550, 320).stroke();
  doc
    .fontSize(12)
    .fillColor("black")
    .text("Description", 50, 330)
    .text("Date", 200, 330)
    .text("Daily Rent", 350, 330)
    .text("Amount", 450, 330);
  doc.moveTo(50, 350).lineTo(550, 350).stroke();

  // Invoice Items - Car Details
  doc
    .text(`Car Detail: ${car.carBrand} ${car.carModel} (${car.color})`, 50, 360)
    .text(
      `${moment(bookingDetails.rentalStartDate).format("YYYY-MM-DD")} ${
        bookingDetails.rentalStartTime
      }`,
      200,
      360
    )
    .text(`${car.rentRate.toFixed(2)} Rs`, 350, 360)
    .text(`${bookingDetails.totalPrice.toFixed(2)} Rs`, 450, 360);

  // // Additional Invoice Items (can add more if needed)
  // doc.text('Additional Services', 50, 380).text('None', 200, 380).text('N/A', 350, 380).text('N/A', 450, 380);

  // Subtotal, Tax, and Total
  const subtotal = bookingDetails.totalPrice;
  // const discount = subtotal * 0.02; // Example: 2% discount
  // const totalDue = subtotal - discount;

  doc
    .moveDown()
    .text("Subtotal", 350, 450)
    .text(`${subtotal.toFixed(2)} Rs`, 450, 450);
  //  doc.text('Discount (2%)', 350, 470).text(`${discount.toFixed(2)} Rs`, 450, 470);
  //  doc.text('Total', 350, 490).text(`${totalDue.toFixed(2)} Rs`, 450, 490);
  //  doc.text('Amount Due', 350, 510).text(`${totalDue.toFixed(2)} Rs`, 450, 510);

  // Footer
  doc
    .fontSize(10)
    .fillColor("gray")
    .text("Thank you for choosing RentRush!", 50, 650, { align: "center" });

  // Finish the document
  doc.end();

  console.log(`Invoice saved at: ${invoicePath}`);
  return invoicePath;
};
