import { useState, useEffect, useRef } from 'react';
import { useSwipeable } from 'react-swipeable';  // Importing the swipeable hook
import {
  Table, Stat, Box, Input, FormControl, Stack, DrawerActionTrigger, Text, Separator, ButtonGroup, Textarea,
  DrawerBackdrop,
  DrawerBody,
  DrawerCloseTrigger,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerRoot,
  DrawerTitle,
  DrawerTrigger, Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, StackSeparator
} from '@chakra-ui/react';
import { Field } from '../components/ui/field';
import { motion, AnimatePresence } from 'framer-motion'; // Importing framer-motion for animations
import BottomNavigationBar from '../components/BottomNavigationBar';
import FloatingActionButton from '../components/FloatingActionButton';

import StatCard from '../components/StatCard'; // Import the StatCard component

import { Drawer, SwipeableDrawer, Typography } from '@mui/material';



// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';

import { collection, getDocs, addDoc, query, where, orderBy,doc,setDoc,getDoc,updateDoc, } from 'firebase/firestore';
import { db } from '../firebaseConfig'; // Import Firestore config






export default function Attendance() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [swipeDirection, setSwipeDirection] = useState(0); // Track swipe direction
  const [open, setOpen] = useState(false)

  const [searchName, setSearchName] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [search, setSearch] = useState(false); // Track search bar visibility

  const nameInputRef = useRef(null); // Create a reference for the input
  // Inside your component
  const searchTimeoutRef = useRef(null);

  const [name, setName] = useState('');
  const [illness, setIllness] = useState('');
  const [medicine, setMedicine] = useState('');

  const [items, setItems] = useState([]);
  const [patientNo, setPatientNo] = useState(0); // Track the patient number

  const [speechTranscript, setSpeechTranscript] = useState(''); // To store the transcript
  const [isListening, setIsListening] = useState(false); // To track the listening state

  // Initialize SpeechRecognition
  const recognition = useRef(null);

  useEffect(() => {


    fetchData();
  }, [currentDate]);

  const fetchData = async () => {
    const querySnapshot = await getDocs(collection(db, "members")); // Firestore collection name
    const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Get today's date in YYYY-MM-DD format
  const updatedCurrentDate = currentDate.toISOString().split('T')[0];

  // Check attendance for each member for today
  const membersWithAttendance = await Promise.all(data.map(async (member) => {
    const attendanceRef = doc(db, "attendances", `${member.id}_${updatedCurrentDate}`);
    const attendanceDoc = await getDoc(attendanceRef);

    if (attendanceDoc.exists()) {
      return { ...member, status: attendanceDoc.data().status };
    } else {
      return { ...member, status: 'absent' };  // Default to absent if no record exists
    }
  }));


    // Sort the filtered data by patientNo in ascending order
    const sortedData = membersWithAttendance.sort((a, b) => b.memberNo - a.memberNo);

    setItems(sortedData);

  };

  // Helper function to compare if the document's createdAt date matches the currentDate
  const isCreatedOnDate = (createdAt, targetDate) => {
    // Check if createdAt exists and is a Firestore timestamp (check if 'seconds' exists)
    if (!createdAt || !createdAt.seconds) {
      console.error("Invalid createdAt field:", createdAt); // Log if something is wrong with createdAt
      return false; // Return false if createdAt is not defined or invalid
    }

    const target = new Date(targetDate); // The selected target date (currentDate)
    const createdDate = new Date(createdAt.seconds * 1000); // Firebase stores timestamp in seconds

    // Compare the year, month, and date parts of the date
    return target.getFullYear() === createdDate.getFullYear() &&
      target.getMonth() === createdDate.getMonth() &&
      target.getDate() === createdDate.getDate();
  };

  const handlers = useSwipeable({
    onSwipedLeft: () => handleDateChange(1, 100),
    onSwipedRight: () => handleDateChange(-1, -100),
    trackMouse: true
  });

  const handleDateChange = (days, direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + days);
    // Check if the new date is in the future
    if (newDate > new Date()) {
      newDate.setDate(new Date().getDate());  // Set the date to today if it's in the future
    }

    setCurrentDate(newDate);
    setSwipeDirection(direction); // Set the direction for animation
    console.log(currentDate)
  };

  const formatDate = (date) => {
    const today = new Date();
    const diffTime = today - date;
    const diffDays = Math.floor(diffTime / (1000 * 3600 * 24));

    // Format the date
    const options = { month: 'short', day: 'numeric' };
    const formattedDate = date.toLocaleDateString('en-US', options);

    // Return the custom formatted string
    if (diffDays === 0) {
      return `Today, ${formattedDate}`;
    } else if (diffDays === 1) {
      return `Yesterday, ${formattedDate}`;
    } else {
      return `${diffDays} Days ago, ${formattedDate}`;
    }
  };

  const formattedDate = formatDate(currentDate);

  // FAB click handler with an alert
  const handleFabClick = () => {
    toggleSearchDrawer();
    //alert('Floating Action Button clicked!');
    setOpen(!open); // Open the drawer
    setTimeout(() => {
      if (nameInputRef.current) {
        nameInputRef.current.focus(); // Focus on the name input field when drawer opens
      }
    }, 2);  // Adjust delay as needed for your animation duration
  };

  // Function to open the search drawer
  const handleSearchClick = () => {
    setSearch(!search); // Toggle the search input visibility
    //setSearch(true);  // Open the drawer
    setTimeout(() => {
      if (nameInputRef.current) {
        nameInputRef.current.focus();  // Focus on the input when the drawer opens
      }
    }, 100);  // Small delay to make sure the drawer is fully opened
  };

  const toggleDrawer = () => {
    setOpen(false);
    setSearch(false);
  };

  const toggleSearchDrawer = () => {
    setOpen(false);
    setSearch(false);
    setSearchName(''); // Clear the search input when closing
    fetchData();
  };

  
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchName(value); // Update the search term

    // Clear the previous timeout to prevent multiple searches being triggered
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set a new timeout to call the search function after 300ms (adjust as needed)
    searchTimeoutRef.current = setTimeout(() => {
      handleSearchSubmit(e); // Trigger the search after the debounce delay
    }, 300); // Adjust the delay as needed (e.g., 300ms)
  };

  const handleSearchSubmit = async (e) => {

    e.preventDefault();
    let value = e.target.value;
    // Capitalize the first letter and make the rest lowercase
    value = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
    console.log(value);

    if (!value) return; // Do nothing if search input is empty

    // Firestore query to fetch names that start with the search text
    const q = query(
      collection(db, "patients"), // Firestore collection
      orderBy("name"), // Order by the name field
      where("name", ">=", value), // Find names starting with the search text
      where("name", "<=", value + "\uf8ff") // Include names with additional characters after the search text
    );

    const querySnapshot = await getDocs(q);

    // Process data and add relative time
    const results = querySnapshot.docs.map(doc => {
      const data = doc.data();
      const createdAt = new Date(data.createdAt.seconds * 1000); // Firebase timestamp
      return {
        id: doc.id,
        patientNo: data.patientNo,
        name: data.name,
        illness: data.illness,
        medicine: data.medicine,
        createdAt: data.createdAt,
        relativeTime: formatDate(createdAt),
      };
    });

    // Sort the results in descending order based on the createdAt field (latest first)
    const sortedResults = results.sort((a, b) => b.createdAt - a.createdAt);

    setItems(sortedResults);
    //setSearchResults(results); // Update search results state
  };

  const resetToToday = () => {
    const today = new Date();
    setCurrentDate(today); // Reset to today's date
    fetchData(); // Fetch data based on today's date
  };

 

  const handleAttendanceClick = async (memberId) => {
    const currentTimestamp = currentDate;
    const dateString = currentTimestamp.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  
    try {
      // 1. Update member's attendance in their subcollection
      const memberAttendanceRef = doc(db, "members", memberId, "attendance", dateString);
      const memberDoc = await getDoc(memberAttendanceRef);
      
      let newStatus;
      
      if (memberDoc.exists()) {
        // If attendance already exists, toggle it between 'present' and 'absent'
        const currentStatus = memberDoc.data().status;
        newStatus = currentStatus === 'present' ? 'absent' : 'present';
        
        await updateDoc(memberAttendanceRef, {
          status: newStatus,
          date: currentTimestamp
        });
      } else {
        // If attendance doesn't exist, set it as present
        newStatus = 'present';
        await setDoc(memberAttendanceRef, {
          status: newStatus,
          date: currentTimestamp
        });
      }
  
      // 2. Update global attendance collection
      const globalAttendanceRef = doc(db, "attendances", `${memberId}_${dateString}`);
      const globalAttendanceDoc = await getDoc(globalAttendanceRef);
  
      if (globalAttendanceDoc.exists()) {
        // If global attendance exists, update the member's attendance
        const currentGlobalStatus = globalAttendanceDoc.data().status;
        newStatus = currentGlobalStatus === 'present' ? 'absent' : 'present';
        
        await updateDoc(globalAttendanceRef, {
          memberId: memberId,
          date: currentTimestamp,
          status: newStatus
        });
      } else {
        // If global attendance doesn't exist, create it with this member's status
        newStatus = 'present'; // Set the member as present initially
        await setDoc(globalAttendanceRef, {
          memberId: memberId,
          date: currentTimestamp,
          status: newStatus
        });
      }
  
      // Optionally, update local state if you have a local array of members
      setItems(prevItems => prevItems.map(item => 
        item.id === memberId ? { ...item, status: newStatus } : item
      ));
  
    } catch (error) {
      console.error("Error updating attendance: ", error);
    }
  };


  return (
    <>
      <div>
        <Box {...handlers} p={6} bg="bg.surface" cursor="grab" overflow="hidden" >
          <AnimatePresence mode="wait">
            <motion.div
              key={formattedDate}
              initial={{ opacity: 0, x: swipeDirection }} // Use swipeDirection here
              animate={{ opacity: 1, x: 0 }}  // Animate to the center
              exit={{ opacity: 0, x: -swipeDirection }} // Exit in the same direction
              transition={{
                duration: 0.0, // Short transition time
                ease: "easeInOut", // This removes the springiness
              }}
            >

              <Stat.Root>
                <Stat.Label>Selected Date</Stat.Label>
                <Stat.ValueText>{formattedDate}</Stat.ValueText>
              </Stat.Root>
            </motion.div>
          </AnimatePresence>
        </Box>
        <FloatingActionButton onClick={handleSearchClick} />
      </div>

      <Table.ScrollArea borderWidth="1px" rounded="md" height="80vh">
        <Table.Root size="md" stickyHeader marginBottom="120px">
          <Table.Header>
            <Table.Row bg="bg.subtle">
              <Table.ColumnHeader textAlign="center">No.</Table.ColumnHeader>
              <Table.ColumnHeader>Name</Table.ColumnHeader>
              <Table.ColumnHeader textAlign="end">Mark Attendance</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>

          <Table.Body>
  {items.map((item) => (
    <Table.Row key={item.id}>
      <Table.Cell textAlign="center">{item.memberNo}</Table.Cell>
      <Table.Cell>{item.name}</Table.Cell>

      <Table.Cell textAlign="end">
        <Button 
          variant={item.status === 'present' ? 'subtle' : 'solid'} 
          onClick={() => handleAttendanceClick(item.id)}
        >
          {item.status === 'present' ? 'Mark Absent' : 'Mark Present'}
        </Button>
      </Table.Cell>
    </Table.Row>
  ))}
</Table.Body>
        </Table.Root>
      </Table.ScrollArea>

      <BottomNavigationBar onSearchClick={handleFabClick} />

      {/* Fixed Search Bar */}
      {search && (
        <div style={{ position: 'fixed', top: 0, width: '100%', padding: '30px 16px', backgroundColor: 'white', zIndex: 2000 }}>

          <Stack direction="row" spacing={4}>
            <Input
              ref={nameInputRef}
              placeholder="Search Name"
              value={searchName}
              onChange={(e) => {
                setSearchName(e.target.value); // Update the search input
                handleSearchChange(e); // Call the submit handler on every keypress
              }}

            />
            <Button colorScheme="teal" type="submit" onClick={toggleSearchDrawer}>
              Close
            </Button>
          </Stack>

        </div>
      )}


    </>
  );
}

