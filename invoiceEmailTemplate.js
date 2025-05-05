export const generateInvoiceEmailTemplate = (
  user,
  car,
  maintenanceCost,
  showroom,
  rentalStartDate,
  rentalEndDate,
  totalPrice
) => {
  let rentalTotal = totalPrice;

  // Format maintenance costs as a table
  const maintenanceItems = Object.entries(maintenanceCost)
    .map(([item, cost]) => {
      const costNumber = parseFloat(cost);
      if (!isNaN(costNumber)) {
        rentalTotal += costNumber;
        return `<tr><td>${String(item.charAt(0)).toUpperCase()}${item.slice(1)}</td><td>PKR ${costNumber.toFixed(2)}</td></tr>`;
      }
      return "";
    })
    .join("");

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Car Maintenance Invoice</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header { background: #394A9A; color: #ffffff; padding: 20px; text-align: center; }
        .header img { max-width: 150px; }
        .content { padding: 20px; }
        h1 { font-size: 24px; color: #333333; margin: 0 0 20px; }
        p { font-size: 16px; color: #555555; line-height: 1.5; margin: 0 0 10px; }
        .details { background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .details p { margin: 5px 0; }
        .highlight { font-weight: bold; color: #394A9A; }
        .footer { background: #394A9A; color: #ffffff; text-align: center; padding: 10px; font-size: 14px; }
        .footer a { color: #ffffff; text-decoration: underline; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th, td { padding: 8px; text-align: left; }
        th { background: #394A9A; color: #ffffff; }
        @media only screen and (max-width: 600px) {
          .container { margin: 10px; }
          .header, .content, .footer { padding: 15px; }
          h1 { font-size: 20px; }
          p { font-size: 14px; }
          th, td { font-size: 14px; padding: 6px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="font-size: 24px; margin: 0; color: #ffffff ">${showroom.showroomName || "Showroom"}</h1>
          <h1 style="color: #ffffff">Car Maintenance Invoice</h1>
        </div>
        <div class="content">
          <p>Dear ${user.ownerName || "Customer"},</p>
          <p>The car you rented, <span class="highlight">${car.carBrand || "Unknown"} ${car.carModel || ""} (${car.year || "N/A"})</span>, has entered maintenance. Please find the invoice attached for your records.</p>
          <div class="details">
            <h2 style="font-size: 18px; color: #333333; margin: 0 0 10px;">Maintenance Details</h2>
            <table>
              <thead>
                <tr>
                  <th>Service Item</th>
                  <th>Cost</th>
                </tr>
              </thead>
              <tbody>
                ${maintenanceItems}
              </tbody>
            </table>
            <p><strong>Start Date:</strong> ${rentalStartDate}</p>
            <p><strong>End Date:</strong> ${rentalEndDate}</p>
            <br />
            <p><strong>Rental Cost:</strong> PKR ${Number(totalPrice || 0).toFixed(2)}</p>
            <p><strong>Maintenance Cost:</strong> PKR ${Object.values(
              maintenanceCost
            )
              .reduce((acc, curr) => acc + (parseFloat(curr) || 0), 0)
              .toFixed(2)}</p>
            <br />
            <p><strong>Grand Total:</strong> PKR ${Number(rentalTotal || 0).toFixed(2)}</p>
          </div>
          <p>Thank you for choosing our service. If you have any questions, feel free to contact us.</p>
        </div>
        <div class="footer">
          <p style="color: #ffffff">Showroom Team © ${new Date().getFullYear()}</p>
          <p><a href="http://localhost:5173">Visit our website</a> | <a href="mailto:rentrush26@gmail.com">Contact Us</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
};
