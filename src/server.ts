import express from "express";
import sequelize from "./config/sequelize";
import driverRoutes from "./routes/driver.route";

// Initialize express app
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(driverRoutes);

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");

    await sequelize.sync();
    console.log("Models have been synchronized.");

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    process.exit(1);
  }
};

startServer();
