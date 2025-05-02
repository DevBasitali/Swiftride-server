export const generateShowroomApprovalEmailTemplate = (
  admin,
  showroom,
  registrationDate,
  ownerDetails
) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Showroom Registration Approval Request</title>
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
        .button { display: inline-block; padding: 10px 20px; margin: 10px 0; background: #394A9A; color: #ffffff; text-decoration: none; border-radius: 5px; }
        @media only screen and (max-width: 600px) {
          .container { margin: 10px; }
          .header, .content, .footer { padding: 15px; }
          h1 { font-size: 20px; }
          p { font-size: 14px; }
          .button { padding: 8px 16px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="font-size: 24px; margin: 0; color: #ffffff">Showroom Registration</h1>
          <h1 style="color: #ffffff">Approval Request</h1>
        </div>
        <div class="content">
          <p>Dear ${admin.name || "Admin"},</p>
          <p>A new showroom, <span class="highlight">${showroom.showroomName || "Unknown Showroom"}</span>, has submitted a registration request for approval. Please review the details below and take appropriate action.</p>
          <div class="details">
            <h2 style="font-size: 18px; color: #333333; margin: 0 0 10px;">Showroom Details</h2>
            <p><strong>Showroom Name:</strong> ${showroom.showroomName || "N/A"}</p>
            <p><strong>Location:</strong> ${showroom.address || "N/A"}</p>
            <p><strong>Registration Date:</strong> ${registrationDate || "N/A"}</p>
            <p><strong>Owner Name:</strong> ${ownerDetails.ownerName || "N/A"}</p>
            <p><strong>Owner Email:</strong> ${ownerDetails.email || "N/A"}</p>
            <p><strong>Owner Contact:</strong> ${ownerDetails.contactNumber || "N/A"}</p>
          </div>
          <p>Please approve or reject this registration request at your earliest convenience or within 12 hours.</p>
          <a href="http://localhost:5173/admin/" class="button">Review Registration</a>
          <p>If you have any questions or require additional information, feel free to contact the showroom owner.</p>
        </div>
        <div class="footer">
          <p style="color: #ffffff">RentRush © ${new Date().getFullYear()}</p>
          <p><a href="http://localhost:5173">Visit our website</a> | <a href="mailto:rentrush26@gmail.com">Contact Support</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
};
