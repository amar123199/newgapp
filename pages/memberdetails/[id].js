import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { db } from "../../firebaseConfig";
import { doc, collection, getDocs, getDoc } from "firebase/firestore";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { height } from "@mui/system";

const MemberDetail = () => {
  const router = useRouter();
  const { id } = router.query; // Get ID from URL
  const [member, setMember] = useState(null);
  const [datesPresent, setDatesPresent] = useState([]);

  useEffect(() => {
    if (!id) return; // Prevent fetching if ID is undefined

    const fetchData = async () => {
      const docRef = doc(db, "members", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setMember(docSnap.data());
      } else {
        console.log("No such document!");
      }

      // Fetch attendance data for the member
      const attendanceRef = collection(db, "members", id, "attendance");
      const attendanceSnapshot = await getDocs(attendanceRef);

      // Extract the dates when the member was present
      const presentDates = attendanceSnapshot.docs
        .filter((doc) => doc.data().status === "present")
        .map((doc) => {
          // Convert the timestamp to YYYY-MM-DD format
          const date = doc.data().date.toDate(); // Firestore timestamp to JS Date
          return date.toISOString().split("T")[0]; // "YYYY-MM-DD"
        });

      setDatesPresent(presentDates);
      console.log(presentDates);
    };

    fetchData();
  }, [id]);

  if (!member) return <p>Loading...</p>;

  // Inline styles for the highlighted dates
  const highlightedStyle = {
    backgroundColor: "#4CAF50", // Green background for present dates
    color: "white", 
    width:"40px" ,
    height:"12px",           // White text color for present dates
  };

  // Tile className logic for highlighting present dates
  const tileClassName = ({ date }) => {
    const dateStr = date.toISOString().split("T")[0]; // Format date to "YYYY-MM-DD"
    if (datesPresent.includes(dateStr)) {
      return "highlight"; // Add the highlight class for present dates
    }
  };

  return (
    <div style={{ padding: "50px" }}>
      <button
        onClick={() => router.back()}
        style={{ marginBottom: "50px", cursor: "pointer" }}
      >
        🔙 Back
      </button>
      <h1>{member.name}</h1>
      <p>Phone: {member.phone}</p>
      <p>Member No: {member.memberNo}</p>

      <p>Attendance Calendar</p>
      <Calendar
      tileClassName={tileClassName} // Apply highlight class based on presence
      tileContent={({ date }) => {
        const dateStr = date.toISOString().split("T")[0];

        // Conditional rendering based on whether the date is present in datesPresent
        if (datesPresent.includes(dateStr)) {
          return (
            <div style={highlightedStyle}>
              {/* Highlighted content or date can go here */}
              {/* {date.getDate()} */}
            </div>
          );
        } else {
          return (
            <div>
              {/* Normal content or date */}
              {/* {date.getDate()} */}
            </div>
          );
        }
      }}
    />
    </div>
  );
};

export default MemberDetail;
