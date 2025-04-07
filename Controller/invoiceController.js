import fs from "fs";
import path from "path";
import { PDFDocument as PDFLibDocument, rgb } from 'pdf-lib'
import { fileURLToPath } from "url";
import Car from "../Model/Car.js";
import User from "../Model/signup.js";
import moment from "moment";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const invoicesDir = path.join(__dirname, "../invoices");
export const generateInvoice = async (bookingDetails) => {
  const car = await Car.findById(bookingDetails.carId);
  const user = await User.findById(bookingDetails.userId);
  const showroom=await User.findById(bookingDetails.showroomId)
  const invoicePath = path.join(invoicesDir,`invoice_${bookingDetails._id}.pdf`);
// save through booking 
  if (fs.existsSync(invoicePath)) {
    // Read Existing file    
    const existingPdfBytes = fs.readFileSync(invoicePath);
    // Existing PDF load
    const pdfDoc = await PDFLibDocument.load(existingPdfBytes);
    //  New page add 
    const page = pdfDoc.addPage([600, 400]);
    const { height } = page.getSize();
    //  Updated data add k
    page.drawText(`${bookingDetails.invoiceType}`, {
      x: 50,
      y: height - 50,
      size: 20,
      color: rgb(0.29, 0.56, 0.89)
    });
    page.drawText(`Invoice Type: ${bookingDetails.invoiceType}`, { x: 50, y: height - 70, size: 14, color:rgb(1, 1, 1) });
    page.drawText(`Booking ID: ${bookingDetails._id}`, { x: 50, y: 320, size: 15 });
        //  Billed To
        page.drawText('Billed To:', { x: 50, y: height - 150, size: 14 });
        page.drawText(`${user.ownerName}\n${user.email}\n${user.address}\n${user.contactNumber}`, { x: 40, y: height - 170, size: 12 });
       //  Table Header
       page.drawLine({ start: { x: 50, y: height - 250 }, end: { x: 550, y: height - 250 }, thickness: 1 });
       page.drawText('Description', { x: 50, y: height - 270, size: 12 });
       page.drawText('Start Date & Time', { x: 180, y: height - 270, size: 12 });
       page.drawText('End Date & Time', { x: 300, y: height - 270, size: 12 });
       page.drawText('Daily Rent', { x: 410, y: height - 270, size: 12 });
       page.drawText('Amount', { x: 480, y: height - 270, size: 12 });
       page.drawLine({ start: { x: 50, y: height - 290 }, end: { x: 550, y: height - 290 }, thickness: 1 });
       //  Table Data
       page.drawText(`${car.carBrand} ${car.carModel} (${car.color})`, { x: 50, y: height - 310, size: 12 });
       page.drawText(`${moment(bookingDetails.rentalStartDate).format("YYYY-MM-DD")}`, { x: 180, y: height - 310, size: 12 });
       page.drawText(`${bookingDetails.rentalStartTime}`, { x: 180, y: height - 325, size: 12 });
       page.drawText(`${moment(bookingDetails.rentalEndDate).format("YYYY-MM-DD")}`, { x: 300, y: height - 310, size: 12 });
       page.drawText(`${bookingDetails.rentalEndTime}`, { x: 300, y: height - 325, size: 12 });
       page.drawText(`${car.rentRate.toFixed(0)} Rs`, { x: 410, y: height - 310, size: 12 });
       page.drawText(`${bookingDetails.totalPrice.toFixed(0)} Rs`, { x: 480, y: height - 310, size: 12 });
       //  Subtotal & Total
       const subtotal = bookingDetails.totalPrice;
       page.drawLine({ start: { x: 50, y: height - 350 }, end: { x: 550, y: height - 350 }, thickness: 1 });
       page.drawText('Subtotal', { x: 410, y: height - 370, size: 12 });
       page.drawText(`${subtotal.toFixed(0)} Rs`, { x: 480, y: height - 370, size: 12 });
       //  Footer
       page.drawLine({ start: { x: 50, y: height - 500 }, end: { x: 550, y: height - 500 }, thickness: 1 });
       page.drawText('Thank you for choosing RentRush!', { x: 50, y: height - 520, size: 10, color:rgb(0.5, 0.5, 0.5) });
    // Updated PDF saved
    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(invoicePath, pdfBytes);
    console.log('Invoice updated successfully!'); 
    return invoicePath
  }
  else {
    const pdfDoc = await PDFLibDocument.create();
    const page = pdfDoc.addPage([600, 400]);
    const { height } = page.getSize();

    //Header
    page.drawRectangle({
      x: 0,
      y: height - 100,
      width: 600,
      height: 100,
      color: rgb(0.29, 0.56, 0.89)
    });
    page.drawText('RentRush Invoice', { x: 50, y: height - 40, size: 30, color:rgb(1, 1, 1) });
    page.drawText(`Invoice Type: ${bookingDetails.invoiceType}`, { x: 50, y: height - 70, size: 14, color:rgb(1, 1, 1) });

    //  Invoice Details
    page.drawText(`Invoice #${bookingDetails._id}`, { x: 400, y: height - 40, size: 14 });
    page.drawText(`Invoice Date: ${moment().format("MMMM Do YYYY")}`, { x: 400, y: height - 60, size: 12 });
    page.drawText(`Due Date: ${moment().add(1, "day").format("MMMM Do YYYY")}`, { x: 400, y: height - 80, size: 12 });

    //  Billed To
    page.drawText('Billed To:', { x: 50, y: height - 150, size: 14 });
    page.drawText(`${user.ownerName}\n${user.email}\n${user.address}\n${user.contactNumber}`, { x: 40, y: height - 170, size: 12 });

    //  From
    page.drawText('From:', { x: 350, y: height - 150, size: 14 });
    page.drawText(`${showroom.showroomName}\n ${showroom.email}\n${showroom.address}\n${showroom.contactNumber}`, { x: 350, y: height - 170, size: 12 });
                  
    //  Table Header
    page.drawLine({ start: { x: 50, y: height - 250 }, end: { x: 550, y: height - 250 }, thickness: 1 });
    page.drawText('Description', { x: 50, y: height - 270, size: 12 });
    page.drawText('Start Date & Time', { x: 180, y: height - 270, size: 12 });
    page.drawText('End Date & Time', { x: 300, y: height - 270, size: 12 });
    page.drawText('Daily Rent', { x: 410, y: height - 270, size: 12 });
    page.drawText('Amount', { x: 480, y: height - 270, size: 12 });
    page.drawLine({ start: { x: 50, y: height - 290 }, end: { x: 550, y: height - 290 }, thickness: 1 });

    //  Table Data
    page.drawText(`${car.carBrand} ${car.carModel} (${car.color})`, { x: 50, y: height - 310, size: 12 });
    page.drawText(`${moment(bookingDetails.rentalStartDate).format("YYYY-MM-DD")}`, { x: 180, y: height - 310, size: 12 });
    page.drawText(`${bookingDetails.rentalStartTime}`, { x: 180, y: height - 325, size: 12 });
    page.drawText(`${moment(bookingDetails.rentalEndDate).format("YYYY-MM-DD")}`, { x: 300, y: height - 310, size: 12 });
    page.drawText(`${bookingDetails.rentalEndTime}`, { x: 300, y: height - 325, size: 12 });
    page.drawText(`${car.rentRate.toFixed(0)} Rs`, { x: 410, y: height - 310, size: 12 });
    page.drawText(`${bookingDetails.totalPrice.toFixed(0)} Rs`, { x: 480, y: height - 310, size: 12 });
    //  Subtotal & Total
    const subtotal = bookingDetails.totalPrice;
    page.drawLine({ start: { x: 50, y: height - 350 }, end: { x: 550, y: height - 350 }, thickness: 1 });
    page.drawText('Subtotal', { x: 410, y: height - 370, size: 12 });
    page.drawText(`${subtotal.toFixed(0)} Rs`, { x: 480, y: height - 370, size: 12 });
    //  Footer
    page.drawLine({ start: { x: 50, y: height - 500 }, end: { x: 550, y: height - 500 }, thickness: 1 });
    page.drawText('Thank you for choosing RentRush!', { x: 50, y: height - 520, size: 10, color:rgb(0.5, 0.5, 0.5) });
    //  Save PDF
    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(invoicePath, pdfBytes);
    console.log(`Invoice saved at: ${invoicePath}`);
  }
};