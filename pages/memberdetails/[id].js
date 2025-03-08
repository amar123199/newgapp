import { useRouter } from "next/router";
import { useEffect, useState,useRef } from "react";
import { db } from "../../firebaseConfig";
import { doc, collection, getDocs, getDoc } from "firebase/firestore";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { height } from "@mui/system";
import html2canvas from 'html2canvas';

const MemberDetail = () => {
  const router = useRouter();
  const { id } = router.query; // Get ID from URL
  const [member, setMember] = useState(null);
  const [datesPresent, setDatesPresent] = useState([]);
  const cardRef = useRef(null);  // Reference for the card div

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
          // Convert the timestamp to Date, then adjust by subtracting one day
      const date = doc.data().date.toDate(); // Firestore timestamp to JS Date
      date.setDate(date.getDate() - 1); // Subtract one day to adjust
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

  // Function to download the card as PNG
  const downloadImage = () => {
    if (cardRef.current) {
      html2canvas(cardRef.current, { scale: 2 }).then((canvas) => {
        // Convert the canvas to PNG and download it
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = 'card-image.png';
        link.click();
      });
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

<div
        ref={cardRef}
        style={{
          backgroundColor:"orange",
          width: '300px',
          height: '200px',
          padding: '20px',
          borderRadius: '8px',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <img
          src="/icons/icon-512x512.png" // Add logo URL from Firestore
          alt="Logo"
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            width: '50px',
            height: '50px',
          }}
        />
        <div style={{ zIndex: 10 }}>
          <h2>{member.name}</h2>
          <p>{member.phone}</p>
        </div>
      </div>

      <button onClick={downloadImage} style={{ marginTop: '20px' }}>
        Download Card as PNG
      </button>
    </div>
  );
};

export default MemberDetail;
