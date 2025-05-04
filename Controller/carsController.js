import nodemailer from "nodemailer";
import { generateInvoiceEmailTemplate } from "../invoiceEmailTemplate.js";
import Booking from "../Model/bookingModel.js";
import car_Model from "../Model/Car.js";
import signup from "../Model/signup.js";
import { generateInvoice } from "./invoiceController.js";
import mongoose from "mongoose";

export const addCar = async (req, res) => {
  try {
    // console.log(req.body);
    const {
      carBrand,
      rentRate,
      carModel,
      year,
      yearOfManufacture,
      make,
      variant,
      engineType,
      images,
      color,
      mileage,
      bodyType,
      transmission,
      seatCapacity,
      luggageCapacity,
      fuelType,
      carFeatures,
    } = req.body;

    if (![carBrand, rentRate, carModel, year, engineType].every(Boolean)) {
      return res.status(400).json("Please provide all required fields.");
    }
    if (req.role !== "showroom") {
      return res
        .status(403)
        .json("Unauthorized action. Only showroom owners can add cars.");
    }

    await car_Model.create({
      carBrand,
      rentRate,
      carModel,
      year,
      yearOfManufacture,
      make,
      variant,
      engineType,
      images,
      availability: "Available", // default value
      userId: req.user,
      color,
      mileage,
      bodyType,
      bodyType,
      transmission,
      seatCapacity,
      luggageCapacity,
      fuelType,
      carFeatures,
    });
    // console.log(req.body);

    // console.log(req.user);
    return res.status(201).json("Car has been added successfully.");
  } catch (error) {
    console.error("Error adding car:", error);
    return res
      .status(500)
      .json("An internal server error occurred. Please try again later.");
  }
};

export const getAllCars = async (req, res) => {
  try {
    const userId = req.user;
    if (!userId) {
      return res.status(401).json("Unauthorized");
    }
    const cars = await car_Model.find({ userId }).populate({
      path: "rentalInfo",
      populate: {
        path: "userId",
      },
    });
    // console.log(cars);
    return res.status(200).json(cars);
  } catch (error) {
    console.error("Error fetching cars:", error);
    return res
      .status(500)
      .json("An internal server error occurred. Please try again later.");
  }
};

export const getAllPaymentCars = async (req, res) => {
  try {
    const userId = req.user;
    if (!userId) {
      return res.status(401).json("Unauthorized");
    }
    const cars = await car_Model
      .find({ userId })
      .populate({
        path: "rentalInfo",
        match: { status: "pending payment" },
        populate: {
          path: "userId",
        },
      })
      .where("rentalInfo")
      .ne(null); // Ensure only cars with valid rentalInfo are returned

    return res.status(200).json(cars);
  } catch (error) {
    console.error("Error fetching pending payment cars:", error);
    return res
      .status(500)
      .json("An internal server error occurred. Please try again later.");
  }
};

// export const getAllPaymentCars = async (req, res) => {
//   try {
//     const userId = req.user;
//     if (!userId) {
//       return res.status(401).json("Unauthorized");
//     }
//     const cars = await car_Model.aggregate([
//       { $match: { userId: new mongoose.Types.ObjectId(userId) } },
//       {
//         $lookup: {
//           from: "Booking",
//           localField: "rentalInfo",
//           foreignField: "_id",
//           as: "rentalInfo",
//         },
//       },
//       { $unwind: "$rentalInfo" },
//       { $match: { "rentalInfo.status": "pending payment" } },
//       {
//         $lookup: {
//           from: "Users_data",
//           localField: "rentalInfo.userId",
//           foreignField: "_id",
//           as: "rentalInfo.user",
//         },
//       },
//       { $unwind: "$rentalInfo.user" },
//     ]);

//     // console.log(cars);
//     return res.status(200).json(cars);
//   } catch (error) {
//     console.error("Error fetching cars:", error);
//     return res
//       .status(500)
//       .json("An internal server error occurred. Please try again later.");
//   }
// };

export const getAllReturnCars = async (req, res) => {
  try {
    const userId = req.user;
    if (!userId) {
      return res.status(401).json("Unauthorized");
    }
    const cars = await car_Model
      .find({ userId })
      .populate({
        path: "rentalInfo",
        populate: {
          path: "userId",
        },
      })
      .where({
        availability: ["Pending Return", "In Maintenance"],
      });

    // console.log(cars);
    return res.status(200).json(cars);
  } catch (error) {
    console.error("Error fetching cars:", error);
    return res
      .status(500)
      .json("An internal server error occurred. Please try again later.");
  }
};

export const getCars = async (req, res) => {
  try {
    const cars = await car_Model
      .find()
      .populate("userId", "ownerName showroomName address");
    return res.status(200).json(cars);
  } catch (error) {
    console.error("Error fetching cars:", error);
    return res
      .status(500)
      .json("An internal server error occurred. Please try again later.");
  }
};

export const updateCar = async (req, res) => {
  try {
    const { Id } = req.params;
    const {
      carBrand,
      rentRate,
      carModel,
      year,
      yearOfManufacture,
      make,
      variant,
      engineType,
      images,
      color,
      mileage,
      bodyType,
      transmission,
      seatCapacity,
      luggageCapacity,
      fuelType,
      carFeatures,
    } = req.body;

    if (req.role !== "showroom") {
      return res
        .status(403)
        .json("Unauthorized action. Only showroom owners can update cars.");
    }

    const booking = await Booking.find({
      carId: Id,
      status: {
        $ne: "returned",
      },
    });

    if (booking?.length > 0) {
      return res.status(400).json("Car is currently booked. Cannot update.");
    }

    //   update a car function
    const updatedCar = await car_Model.findByIdAndUpdate(
      Id,
      {
        carBrand,
        rentRate,
        carModel,
        year,
        variant,
        yearOfManufacture,
        make,
        engineType,
        images,
        color,
        mileage,
        bodyType,
        transmission,
        seatCapacity,
        luggageCapacity,
        fuelType,
        carFeatures,
      },
      { new: true, runValidators: true } // Options to return the updated document and run validations
    );

    if (!updatedCar) {
      return res.status(404).json("Car not found.");
    }

    return res
      .status(200)
      .json({ message: "Car has been updated successfully.", car: updatedCar });
  } catch (error) {
    console.error("Error updating car:", error);
    return res
      .status(500)
      .json("An internal server error occurred. Please try again later.");
  }
};

export const removeCar = async (req, res) => {
  try {
    if (req.role !== "showroom") {
      return res
        .status(403)
        .json("Access denied. Only showroom owners can delete cars.");
    }
    const _id = req.params.id;
    const car = await car_Model.findById(_id);
    if (!car) {
      return res.status(404).json("Car not found. Please try again.");
    }
    const booking = await Booking.findById(car.rentalInfo);
    if (!booking || booking?.status === "returned") {
    } else {
      return res.status(400).json("Car is currently booked. Cannot delete.");
    }
    if (req.user !== car.userId.toString()) {
      return res
        .status(403)
        .json("Access denied. You can only delete cars you own.");
    }

    await car_Model.findByIdAndDelete(_id);

    return res.status(200).json("Car has been successfully deleted.");
  } catch (error) {
    console.error("Error deleting car:", error);
    return res
      .status(500)
      .json("An internal server error occurred. Please try again later.");
  }
};

export const searchCar = async (req, res) => {
  try {
    const { carmodel, carbrand } = req.query;

    const query = {};
    if (!carmodel && !carbrand) {
      return res
        .status(400)
        .json("Please enter car model or car brand to search");
    }
    if (carmodel) {
      query.carModel = { $regex: carmodel, $options: "i" };
    }
    if (carbrand) {
      query.carBrand = { $regex: carbrand, $options: "i" };
    }
    // const cars = await car_Model.find(query).populate('userId');
    console.log(query);

    const cars = await car_Model
      .find(query)
      .populate("userId", "showroomName -_id");

    if (cars.length === 0) {
      return res
        .status(404)
        .json("No cars found matching your search criteria.");
    }

    return res.status(200).json(cars);
  } catch (error) {
    console.error("Error searching for cars:", error);
    return res.status(500).json("Internal server error");
  }
};

// Return details api
export const updateReturnDetails = async (req, res) => {
  const { carId, mileage, fuelLevel } = req.body;

  try {
    if (req.role !== "showroom") {
      return res
        .status(403)
        .json("Access denied. Only showroom owners can update Return Details");
    }

    const car = await car_Model.findByIdAndUpdate(
      carId,
      { mileage, fuelLevel },
      { new: true, runValidators: true, context: "query" } // update only specified fields
    );
    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    return res.status(200).json({
      message: "Car return details updated successfully",
      car: car,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Add a maintenance log and update car status to "In Maintenance"
export const addMaintenanceLog = async (req, res) => {
  const { carId, tasks } = req.body;

  try {
    if (req.role !== "showroom") {
      return res
        .status(403)
        .json("Access denied. Only showroom owners can add maintenance logs");
    }
    const car = await car_Model.findById(carId);
    if (!car) return res.status(404).json({ message: "Car not found" });

    car.maintenanceLogs.push({ tasks });
    car.availability = "In Maintenance"; // Update status
    await car.save();

    res.status(200).json({ message: "Maintenance log added", car });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Set car status to "Available" after maintenance
export const startMaintenance = async (req, res) => {
  try {
    const {
      carId,
      showroomId,
      maintenanceCost,
      maintenanceLog,
      repairDescriptions,
      rentalStartDate,
      rentalStartTime,
      rentalEndDate,
      rentalEndTime,
    } = req.body;

    const car = await car_Model.findById(carId).populate("rentalInfo");
    if (!car) return res.status(404).json({ message: "Car not found" });

    const rentalStartDateis = new Date(rentalStartDate);
    const rentalEndDateis = new Date(rentalEndDate);
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    let rentalDuration =
      (rentalEndDateis - rentalStartDateis) / (1000 * 60 * 60 * 24);
    if (rentalDuration === 0) {
      rentalDuration = 1;
    }
    const daysRented = Math.max(0, Math.ceil(rentalDuration));
    const totalPrice = daysRented * car.rentRate;
    const formattedRentalStartDate = rentalStartDateis
      .toISOString()
      .slice(0, 10);
    const formattedRentalEndDate = rentalEndDateis.toISOString().slice(0, 10);

    const formatTimeTo12Hour = (time) => {
      const [hour, minute] = time.split(":").map(Number);
      const period = hour >= 12 ? "PM" : "AM";
      const formattedHour = hour % 12 || 12;
      return `${formattedHour}:${minute.toString().padStart(2, "0")} ${period}`;
    };

    const formattedRentalStartTime = formatTimeTo12Hour(rentalStartTime);
    const formattedRentalEndTime = formatTimeTo12Hour(rentalEndTime);

    if (req.role !== "showroom") {
      return res
        .status(403)
        .json("Access denied. Only showroom owners can complete maintenance");
    }

    const booking = await Booking.findById(car.rentalInfo._id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    booking.repairDescriptions = repairDescriptions;

    const invoicePath = await generateInvoice({
      _id: car.rentalInfo?._id,
      carId,
      maintenanceCost,
      userId: car.rentalInfo?.userId,
      showroomId,
      rentalStartDate: formattedRentalStartDate,
      rentalEndDate: formattedRentalEndDate,
      rentalStartTime: formattedRentalStartTime,
      rentalEndTime: formattedRentalEndTime,
      totalPrice,
      invoiceType: "Maintenance Invoice Generated",
      updateCount: 0,
    });

    const invoiceUrl = `${req.protocol}://${req.get(
      "host"
    )}/api/bookcar/invoices/${invoicePath.invoiceName}`;

    booking.invoiceUrls.push(invoiceUrl);
    booking.currentInvoiceUrl = invoiceUrl;
    car.availability = "In Maintenance";
    car.maintenanceLogs.push({
      bookingId: car.rentalInfo._id,
      tasks: maintenanceLog,
      repairCosts: maintenanceCost,
      repairDescriptions: repairDescriptions,
    });

    const showroom = await signup.findById(showroomId);
    const user = await signup.findById(car.rentalInfo?.userId);
    if (user) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      // Beautiful HTML email template
      const emailTemplate = generateInvoiceEmailTemplate(
        user,
        car,
        maintenanceCost,
        showroom,
        formattedRentalStartDate,
        formattedRentalEndDate,
        totalPrice
      );

      // Email options
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: "Car Maintenance Started - Invoice",
        html: emailTemplate, // Use HTML template
        text: `Dear ${user.name || "Customer"},\n\nYour car (${car.carBrand} ${car.carModel} ${car.year}) has entered maintenance. Please find the invoice attached.\n\nDetails:\n- Start Date: ${formattedRentalStartDate}\n- End Date: ${formattedRentalEndDate}\n- Total Cost: $${totalPrice.toFixed(2)}\n\nThank you for choosing our service!\n\nBest regards,\nShowroom Team`, // Fallback text
        attachments: [
          {
            filename: invoicePath.invoiceName,
            path: invoiceUrl, // Use server file path, not URL
            contentType: "application/pdf",
          },
        ],
      };

      await transporter.sendMail(mailOptions);
    }
    await booking.save();
    await car.save();

    res
      .status(200)
      .json({ message: "Car status updated to Maintenance", car, invoiceUrl });
  } catch (error) {
    console.error("Error starting maintenance:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Set car status to "Available" after maintenance
export const completeMaintenance = async (req, res) => {
  const { id } = req.params;

  try {
    if (req.role !== "showroom") {
      return res
        .status(403)
        .json("Access denied. Only showroom owners can complete maintenance");
    }

    const car = await car_Model.findById(id).populate("rentalInfo");
    if (!car) return res.status(404).json({ message: "Car not found" });

    const booking = await Booking.findById(car.rentalInfo._id);

    booking.status = "pending payment";
    car.availability = "Pending Payment";

    await car.save();
    await booking.save();

    res.status(200).json({ message: "Car status updated to Available", car });
  } catch (error) {
    console.log(error);

    res.status(500).json({ message: "Server error", error });
  }
};

export const markPaymentReceived = async (req, res) => {
  const { id } = req.params;

  try {
    if (req.role !== "showroom") {
      return res
        .status(403)
        .json(
          "Access denied. Only showroom owners can mark payment as received"
        );
    }

    const car = await car_Model.findById(id).populate("rentalInfo");
    if (!car) return res.status(404).json({ message: "Car not found" });

    const booking = await Booking.findById(car.rentalInfo._id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    booking.status = "returned";
    car.availability = "Available";

    await car.save();
    await booking.save();

    res.status(200).json({ message: "Payment marked as received", car });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error", error });
  }
};
