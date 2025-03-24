import car_Model from "../Model/Car.js";
export const addCar = async (req, res) => {
  try {
    // console.log(req.body);
    const {
      carBrand,
      rentRate,
      carModel,
      year,
      make,
      engineType,
      images,
      color,
      mileage,
      bodyType,
      transmission,
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
      make,
      engineType,
      images,
      availability: "Available", // default value
      userId: req.user,
      color,
      mileage,
      bodyType,
      bodyType,
      transmission,
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
      make,
      engineType,
      images,
      color,
      mileage,
      bodyType,
      transmission,
    } = req.body;

    if (req.role !== "showroom") {
      return res
        .status(403)
        .json("Unauthorized action. Only showroom owners can update cars.");
    }
    //   update a car function
    const updatedCar = await car_Model.findByIdAndUpdate(
      Id,
      {
        carBrand,
        rentRate,
        carModel,
        year,
        make,
        engineType,
        images,
        color,
        mileage,
        bodyType,
        transmission,
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
    console.log(_id);
    const car = await car_Model.findById(_id);
    if (!car) {
      return res.status(404).json("Car not found. Please try again.");
    }
    console.log({ userID: car.userId });
    console.log({ uid: req.user });
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
export const completeMaintenance = async (req, res) => {
  const { carId } = req.body;

  try {
    if (req.roel !== "showroom") {
      return res
        .status(403)
        .json("Access denied. Only showroom owners can complete maintenance");
    }

    const car = await car_Model.findById(carId);
    if (!car) return res.status(404).json({ message: "Car not found" });

    car.availability = "Available"; // Set status to available
    await car.save();

    res.status(200).json({ message: "Car status updated to Available", car });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
