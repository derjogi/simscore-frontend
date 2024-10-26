import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  console.log("Received request with id:", params.id);
  const id = params.id;
  console.log("Step 1");
  // Initialize MongoDB client (you may want to use a connection pool or singleton)
  const client = new MongoClient(process.env.MONGODB_URI as string);

  try {
    await client.connect();
    const db = client.db("SimScore");
    const collection = db.collection("Sessions");
    console.log("Step 2");
    // Convert string id to ObjectId
    const objectId = new ObjectId(id);
    const document = await collection.findOne({ _id: objectId });
    console.log("Step 3");
    if (document) {
      console.log("Found document")
      
      // Convert _id to string and rename to id
      const { _id, ...rest } = document;
      const result = { id: _id.toString(), ...rest };
      console.log(result)
      return NextResponse.json(result);
    } else {
      console.log("Step 4 - not found");
      console.log("Document with id not found: ", id)
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }
  } catch (error) {
    console.error("Error retrieving session:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  } finally {
    await client.close();
  }
}
