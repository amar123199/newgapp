import { useState, useEffect, useRef } from 'react';
import { useSwipeable } from 'react-swipeable';  // Importing the swipeable hook
import {
  Table, Stat, Box, Input, FormControl, Stack, DrawerActionTrigger, Text, Separator, ButtonGroup, Textarea, HStack,
  DrawerBackdrop,
  DrawerBody,
  DrawerCloseTrigger,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerRoot,
  DrawerTitle,
  DrawerTrigger, Button,Heading, Modal, ModalOverlay,Icon, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, StackSeparator
} from '@chakra-ui/react';
import { Field } from '../components/ui/field';
import { motion, AnimatePresence } from 'framer-motion'; // Importing framer-motion for animations
import BottomNavigationBar from '../components/BottomNavigationBar';
import FloatingActionButton from '../components/FloatingActionButton';

import StatCard from '../components/StatCard'; // Import the StatCard component

import { Drawer, SwipeableDrawer, Typography } from '@mui/material';

import PeopleIcon from '@mui/icons-material/People'; // For Members



// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';

import { collection, getDocs, addDoc, query, where, orderBy,Timestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig'; // Import Firestore config






export default function Home() {
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
  const [todaysPresentCount, setTodaysPresentCount] = useState(0);


  const [speechTranscript, setSpeechTranscript] = useState(''); // To store the transcript
  const [isListening, setIsListening] = useState(false); // To track the listening state

  // Initialize SpeechRecognition
  const recognition = useRef(null);

  useEffect(() => {
    const fetchPresentCount = async () => {
      const presentCount = await getTodaysPresentCount();
      // Optionally, you can update some state to display the count in your UI
      setTodaysPresentCount(presentCount); // Assuming you have a state variable for this
    };
  
    fetchPresentCount();
  }, []); // Fetch the count whenever the current date changes
  

  const getTodaysPresentCount = async () => {
    try {
      // Get today's date in YYYY-MM-DD format for comparison
      const today = new Date();
      today.setHours(0, 0, 0, 0);  // Set the time to midnight (00:00:00)
      const startOfToday = Timestamp.fromDate(today); // Get Firestore Timestamp for midnight
  
      // Get tomorrow's date, and set the time to midnight
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      const startOfTomorrow = Timestamp.fromDate(tomorrow); // Firestore Timestamp for the start of tomorrow
  
      // Query the 'attendances' collection for records from today (from midnight to just before tomorrow)
      const q = query(
        collection(db, "attendances"),
        where("date", ">=", startOfToday), // Start of today
        where("date", "<", startOfTomorrow), // Start of tomorrow (exclusive)
        where("status", "==", "present") // Only "present" status
      );
  
      const querySnapshot = await getDocs(q);
  
      // Get the count of documents that match today's present attendance
      const presentCount = querySnapshot.size;
  
      console.log("Today's Present Count: ", presentCount); // Log the result
      return presentCount;
    } catch (error) {
      console.error("Error getting today's present count: ", error);
      return 0; // Return 0 if an error occurs
    }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Capitalize the first letter of the name
    const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);

    console.log({ capitalizedName, illness, medicine });

    if (!capitalizedName || !illness || !medicine) {
      alert("Please fill all fields before saving.");
      return;
    }

    try {
      const docRef = await addDoc(collection(db, "patients"), {
        name: capitalizedName,
        illness,
        medicine,
        createdAt: new Date(), // Timestamp
        patientNo: patientNo,  // Assign the patient number
      });

      console.log("Document written with ID: ", docRef.id);

      // Update local state to reflect new patient, converting the createdAt to a valid Date object
      const newPatient = {
        id: docRef.id,
        name: capitalizedName,
        illness,
        medicine,
        patientNo,
        createdAt: new Date() // Ensure it's converted to a JavaScript Date object
      };

      // Update local state to reflect new patient
      setItems(prevItems => [...prevItems, newPatient]); // Update state with new patient
      setPatientNo(patientNo + 1);

      // After adding, trigger a fresh data fetch to update the UI
      fetchData();

      // Reset input fields
      setName("");
      setIllness("");
      setMedicine("");
      setOpen(false); // Close the drawer
    } catch (error) {
      console.error("Error adding document: ", error);
    }
    // You can add your save functionality here, like sending data to an API or saving locally
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

 

  


  return (
    <>
      <div>
       <Heading>Rana Gym</Heading>
      </div>

      <Stat.Root maxW="240px" borderWidth="1px" p="4" rounded="md">
      <HStack justify="space-between">
        <Stat.Label>Today Attendance</Stat.Label>
        <Icon color="fg.muted">
          <PeopleIcon />
        </Icon>
      </HStack>
      <Stat.ValueText>{todaysPresentCount}</Stat.ValueText>
    </Stat.Root>


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

