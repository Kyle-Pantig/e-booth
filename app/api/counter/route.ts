import { Counter } from "@/models/Counter";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

const MONGODB_URI = process.env.MONGO_URI as string;

// Connect to MongoDB
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(MONGODB_URI, { dbName: "ebooth" });
};

// **GET Request**: Fetch Counter Data
export async function GET() {
  try {
    await connectDB();
    const counter = await Counter.findOne();

    if (!counter) {
      return NextResponse.json(
        { message: "Counter not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      pageviews: counter.pageviews,
      visits: counter.visits,
    });
  } catch (error) {
    console.error("Error fetching counter data:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// **POST Request**: Increment Counter Based on `type`
export async function POST(req: Request) {
  try {
    await connectDB();

    // 🔥 Fix: Ensure we parse the request body correctly
    const body = await req.json();
    const { type } = body;

    if (!type) {
      return NextResponse.json(
        { message: "Missing 'type' parameter" },
        { status: 400 }
      );
    }

    let counter = await Counter.findOne();
    if (!counter) {
      counter = new Counter({ pageviews: 0, visits: 0 });
    }

    // Increment based on type
    if (type === "visit-pageview") {
      counter.pageviews += 1;
      counter.visits += 1;
    } else if (type === "pageview") {
      counter.pageviews += 1;
    }

    await counter.save();

    return NextResponse.json({
      pageviews: counter.pageviews,
      visits: counter.visits,
    });
  } catch (error) {
    console.error("Error updating counter:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
