import mongoose from "mongoose";
const connectDB = async() =>{
    try {
      const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/spendsense`)
      console.log(`\n MongoDb connected !! DB HOST: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MONGO_DB CONECTION FAILED: ", error);
        process.exit(1)
    }
}

export default connectDB