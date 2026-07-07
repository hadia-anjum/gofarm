import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/firebase-admin-auth";
import { client, writeClient } from "@/sanity/lib/client";

// GET - Fetch all stores
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const stores = await client.fetch(
      `*[_type == "store"] | order(sortOrder asc, name asc) {
        _id,
        name,
        slug,
        image,
        address,
        coordinates,
        contact,
        hours,
        description,
        features,
        isActive,
        sortOrder
      }`
    );

    return NextResponse.json({ stores }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching stores:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch stores" },
      { status: 500 }
    );
  }
}

// POST - Create a new store
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const storeData = {
      _type: "store",
      name: body.name,
      slug: { current: body.slug },
      address: {
        street: body.street,
        house: body.houseNumber || "",
        city: body.city,
        state: body.state || "",
        zipCode: body.postalCode,
        country: body.country,
      },
      coordinates: {
        lat: parseFloat(body.latitude),
        lng: parseFloat(body.longitude),
      },
      contact: {
        phone: body.phone,
        email: body.email,
      },
      description: body.description || "",
      features: body.features || [],
      isActive: body.isActive ?? true,
      sortOrder: parseInt(body.sortOrder || "0"),
      hours: {
        monday: {
          open: body.mondayOpen || "09:00",
          close: body.mondayClose || "18:00",
          closed: body.mondayClosed || false,
        },
        tuesday: {
          open: body.tuesdayOpen || "09:00",
          close: body.tuesdayClose || "18:00",
          closed: body.tuesdayClosed || false,
        },
        wednesday: {
          open: body.wednesdayOpen || "09:00",
          close: body.wednesdayClose || "18:00",
          closed: body.wednesdayClosed || false,
        },
        thursday: {
          open: body.thursdayOpen || "09:00",
          close: body.thursdayClose || "18:00",
          closed: body.thursdayClosed || false,
        },
        friday: {
          open: body.fridayOpen || "09:00",
          close: body.fridayClose || "18:00",
          closed: body.fridayClosed || false,
        },
        saturday: {
          open: body.saturdayOpen || "09:00",
          close: body.saturdayClose || "18:00",
          closed: body.saturdayClosed || false,
        },
        sunday: {
          open: body.sundayOpen || "09:00",
          close: body.sundayClose || "18:00",
          closed: body.sundayClosed || false,
        },
      },
    };

    const result = await writeClient.create(storeData);

    return NextResponse.json(
      { message: "Store created successfully", store: result },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating store:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create store" },
      { status: 500 }
    );
  }
}
