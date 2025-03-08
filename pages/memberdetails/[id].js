import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { db } from "../../firebaseConfig"
import { doc, getDoc } from "firebase/firestore";

const MemberDetail = () => {
  const router = useRouter();
  const { id } = router.query; // Get ID from URL
  const [member, setMember] = useState(null);

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
    };

    fetchData();
  }, [id]);

  if (!member) return <p>Loading...</p>;

  return (
    <div style={{"padding":"50px"}}>
        <button onClick={() => router.back()} style={{ marginBottom: "50px", cursor: "pointer" }}>
        🔙 Back
      </button>
      <h1>{member.name}</h1>
      <p>Phone: {member.phone}</p>
      <p>Member No: {member.memberNo}</p>
    </div>
  );
};

export default MemberDetail;
