import { NextResponse, NextRequest } from "next/server";
import { adminDb, admin } from "@/lib/firebaseAdmin";
import dayjs from "dayjs";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  if (!adminDb || !admin || !admin.auth()) {
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const idToken = authHeader.split("Bearer ")[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken, true);
    const userId = decodedToken.uid;

    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "month";

    let startDate;
    switch (range) {
      case "day":
        startDate = dayjs().subtract(1, "day").toDate();
        break;
      case "week":
        startDate = dayjs().subtract(7, "days").toDate();
        break;
      case "year":
        startDate = dayjs().subtract(1, "year").toDate();
        break;
      case "month":
      default:
        startDate = dayjs().subtract(1, "month").toDate();
        break;
    }

    const notesSnapshot = await adminDb
      .collection("notes")
      .where("userId", "==", userId)
      .where("timestamp", ">=", startDate)
      .orderBy("timestamp", "asc")
      .get();

    if (notesSnapshot.empty) {
      return NextResponse.json([], { status: 200 });
    }

    // --- NEW LOGIC FOR DAILY VIEW ---
    if (range === "day") {
      const chartData = notesSnapshot.docs
        .map((doc) => {
          const note = doc.data();
          if (typeof note.sentimentScore === "number") {
            return {
              name: `Note @ ${dayjs(note.timestamp.toDate()).format("h:mm A")}`,
              "Sentiment Score": parseFloat(note.sentimentScore.toFixed(2)),
            };
          }
          return null;
        })
        .filter(Boolean); // Filter out any null entries

      return NextResponse.json(chartData, { status: 200 });
    }

    // --- EXISTING AGGREGATION LOGIC FOR OTHER VIEWS ---
    if (range === "year") {
      // ... (no changes to year logic)
      const sentimentByMonth: {
        [key: string]: { totalScore: number; count: number };
      } = {};
      notesSnapshot.docs.forEach((doc) => {
        const note = doc.data();
        if (note.timestamp && typeof note.sentimentScore === "number") {
          const date = dayjs(note.timestamp.toDate()).format("YYYY-MM");
          if (!sentimentByMonth[date]) {
            sentimentByMonth[date] = { totalScore: 0, count: 0 };
          }
          sentimentByMonth[date].totalScore += note.sentimentScore;
          sentimentByMonth[date].count += 1;
        }
      });
      const chartData = Object.keys(sentimentByMonth).map((date) => {
        const avgScore =
          sentimentByMonth[date].totalScore / sentimentByMonth[date].count;
        return {
          date: dayjs(date).format("MMM YYYY"),
          "Average Sentiment": parseFloat(avgScore.toFixed(2)),
        };
      });
      return NextResponse.json(chartData, { status: 200 });
    } else {
      // ... (no changes to week/month logic)
      const sentimentByDay: {
        [key: string]: { totalScore: number; count: number };
      } = {};
      notesSnapshot.docs.forEach((doc) => {
        const note = doc.data();
        if (note.timestamp && typeof note.sentimentScore === "number") {
          const date = dayjs(note.timestamp.toDate()).format("YYYY-MM-DD");
          if (!sentimentByDay[date]) {
            sentimentByDay[date] = { totalScore: 0, count: 0 };
          }
          sentimentByDay[date].totalScore += note.sentimentScore;
          sentimentByDay[date].count += 1;
        }
      });

      const chartData = Object.keys(sentimentByDay).map((date) => {
        const avgScore =
          sentimentByDay[date].totalScore / sentimentByDay[date].count;
        return {
          date: dayjs(date).format("MMM DD"),
          "Average Sentiment": parseFloat(avgScore.toFixed(2)),
        };
      });
      return NextResponse.json(chartData, { status: 200 });
    }
  } catch (error: any) {
    console.error("Error fetching sentiment insights:", error);
    return NextResponse.json(
      { error: "Failed to fetch insights." },
      { status: 500 }
    );
  }
}
