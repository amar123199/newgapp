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
  DrawerTrigger, Button, CheckboxGroup, Group, NativeSelect, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, StackSeparator,
  Flex, InputAddon, HStack, FormatNumber, Badge,
  Heading
} from '@chakra-ui/react';
import { Field } from '../components/ui/field';
import { CheckboxCard } from "@/components/ui/checkbox-card"
import { motion, AnimatePresence } from 'framer-motion'; // Importing framer-motion for animations
import BottomNavigationBar from '../components/BottomNavigationBar';
import FloatingActionButton from '../components/FloatingActionButton';
import AddActionButton from '../components/AddActionButton';
import ResetActionButton from '../components/ResetActionButton';
import StatCard from '../components/StatCard'; // Import the StatCard component

import { Drawer, SwipeableDrawer, Typography } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People'; // For Members
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter'; 
import SportsGymnasticsIcon from '@mui/icons-material/SportsGymnastics'; 
import SportsKabaddiIcon from '@mui/icons-material/SportsKabaddi'; 



// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';

import { collection, getDocs, addDoc, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebaseConfig'; // Import Firestore config






export default function Members() {
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
  const [phone, setPhone] = useState('');
  const [feesDue, setFeesDue] = useState('');
  const [attendance, setAttendance] = useState('');
  const [joinedDate, setJoinedDate] = useState(new Date()); // Can be set to current date or specific date format

  const [items, setItems] = useState([]);
  const [memberNo, setMemberNo] = useState(0); // Track the member number

  const [selectedTraining, setSelectedTraining] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(1);
  const [totalFees, setTotalFees] = useState(0);

  const [startDate, setStartDate] = useState(new Date());  // Start date is today
  const [endDate, setEndDate] = useState(null);  // This will hold the calculated end date




  useEffect(() => {


    fetchData();
  }, [currentDate]);

  const fetchData = async () => {
    const querySnapshot = await getDocs(collection(db, "members")); // Firestore collection name
    const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // For each member, fetch the end date from their membership subcollection
  const membersWithEndDate = await Promise.all(data.map(async (member) => {
    const membershipSnapshot = await getDocs(collection(db, "members", member.id, "membership"));
    const membershipData = membershipSnapshot.docs.map(doc => doc.data());

    const endDate = membershipData.length > 0 ? membershipData[0].endDate.toDate() : null; // Assuming there is at least one membership
    return { ...member, endDate }; // Add endDate to the member object
  }));

    // Filter data to only include entries created on the selected date (currentDate)
  const filteredData = membersWithEndDate.filter(item => isCreatedOnDate(item.createdAt, currentDate));

    // Sort the filtered data by memberNo in ascending order
    const sortedData = filteredData.sort((a, b) => b.memberNo - a.memberNo);

    setItems(sortedData);
     console.log(sortedData)
    // Set the member number to be the next available number (i.e., current member count + 1)
    setMemberNo(filteredData.length + 1);
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
   // Reset form states to their initial values
  setName('');
  setPhone('');
  setFeesDue('');
  setAttendance('');
  setJoinedDate(new Date());  // or set it to null if needed
  setSelectedTraining([]);
  setSelectedPackage(1);  // Default to the first package
  setStartDate(new Date());  // Default to today
  setEndDate(null);  // Set the end date to null initially
  setSearchName(''); // Clear the search input
  setOpen(false); // Close the drawer
  setSearch(false); // Close the search input

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

    console.log({ capitalizedName, phone });

    if (!capitalizedName || !phone || selectedTraining.length === 0) {
      alert("Please fill all fields before saving.");
      return;
    }

    try {
      const docRef = await addDoc(collection(db, "members"), {
        name: capitalizedName,
        phone,
        createdAt: new Date(), // Timestamp
        status: "active",  // Default status is "active"
        memberNo: memberNo,  // Assign the member number
      });

      console.log("Document written with ID: ", docRef.id);

      // Create a membership subcollection for the member
      const membershipRef = await addDoc(collection(db, "members", docRef.id, "membership"), {
        trainingType: selectedTraining,
        package: selectedPackage,
        startDate: startDate,
        endDate: endDate,
        fees: totalFees,
    });

    console.log("Membership details added with ID: ", membershipRef.id);

    // Create a global membership record in the 'memberships' collection
   const globalmembership = await addDoc(collection(db, "memberships"), {
      memberID: docRef.id,
      trainingType: selectedTraining,
      package: selectedPackage,
      startDate: startDate,
      endDate: endDate,
      fees: totalFees,
  });

  console.log("global membership details added with ID: ", globalmembership.id);

      // Update local state to reflect new member, converting the createdAt to a valid Date object
      const newMember = {
        id: docRef.id,
        name: capitalizedName,
        phone,
        feesDue,
        attendance,
        memberNo,
        joinedAt: joinedDate,
        createdAt: new Date() // Ensure it's converted to a JavaScript Date object
      };

      // Update local state to reflect new member
      setItems(prevItems => [...prevItems, newMember]); // Update state with new member
      setMemberNo(memberNo + 1);

      // After adding, trigger a fresh data fetch to update the UI
      fetchData();

      // Reset input fields
      setName("");
      setPhone("");
      setFeesDue("");
      setAttendance("");
      setJoinedDate(new Date());
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
      collection(db, "members"), // Firestore collection
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
        memberNo: data.memberNo,
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

  const handleTrainingChange = (event) => {
    const { value, checked } = event.target;
  
    setSelectedTraining((prev) => {
      if (checked) {
        // If the checkbox is checked, add it to the list
        return [...prev, value];
      } else {
        // If the checkbox is unchecked, remove it from the list
        return prev.filter((item) => item !== value);
      }
    });
  };

  const handlePackageChange = (event) => {
    const selectedPackageValue = event.target.value;
    setSelectedPackage(selectedPackageValue);
    
    // Calculate the number of days to add (30 days per month)
    const daysToAdd = selectedPackageValue * 30;
  
    // Create a new Date object for the end date by adding the number of days
    const newEndDate = new Date(startDate); // Start with today's date (start date)
    newEndDate.setDate(newEndDate.getDate() + daysToAdd);
  
    // Set the end date
    setEndDate(newEndDate);
   
  };
  
  useEffect(() => {
    // Set default end date to 1 month (30 days) from start date when the page loads
    const defaultEndDate = new Date(startDate);  // Start with the current start date
    defaultEndDate.setDate(defaultEndDate.getDate() + 30);  // Add 30 days (1 month)
  
    setEndDate(defaultEndDate);  // Set the end date to default
  }, [startDate]);  // This effect runs only once on component mount or when startDate changes
  
  
// Format dates (e.g., Feb 22, 2025)
const formatDate2 = (date) => {
  const options = { month: 'short', day: 'numeric', year: 'numeric' };
  return date.toLocaleDateString('en-US', options);
};
  useEffect(() => {
    // Calculate total based on selected training and package
    const trainingTotal = selectedTraining.reduce((sum, type) => sum + trainingFees[type], 0);
    const packageMultiplier = selectedPackage || 1;
    setTotalFees(trainingTotal * packageMultiplier);
    console.log(selectedTraining)
  }, [selectedTraining, selectedPackage]);

  // Utility function to determine badge color based on endDate
const getBadgeColorByDateDifference = (endDate) => {
  if (!endDate) {
    console.error("Invalid endDate.");
    return "gray"; // Return default gray color if endDate is invalid
  }

  // Convert endDate string to Date object
  const endDateObj = new Date(endDate);

  // Check if endDateObj is a valid Date
  if (isNaN(endDateObj.getTime())) {
    console.error("Invalid endDate object:", endDateObj);
    return "gray"; // Return default gray color if endDate conversion failed
  }

  // Get current date
  const currentDate = new Date();

  // Calculate the difference in milliseconds
  const diffTime = endDateObj - currentDate;

  // If the diffTime is negative, it means the endDate is in the past, handle this case
  if (diffTime < 0) {
    console.log("The end date has already passed.");
    return "gray"; // Return gray if the endDate is in the past
  }

  // Convert milliseconds to days and round it to the nearest whole number
  const diffDays = Math.ceil(diffTime / (1000 * 3600 * 24)); // This rounds up to the nearest integer
  
  console.log(diffDays + " days difference");

  // Return color and display text based on the difference
  if (diffDays <= 3) {
    return { color: "red", displayText: `${diffDays} days` }; // Less than or equal to 3 days
  } else if (diffDays <= 7) {
    return { color: "yellow", displayText: `${diffDays} days` }; // Less than or equal to 7 days
  } else {
    return { color: "gray", displayText: formatDate2(endDate) }; // Display the actual date if more than 7 days
  }
};
  

  return (
    <>
      <div>
        <Box  p={6} >
          <Heading>Total Members: {memberNo-1}</Heading>
        </Box>
        <FloatingActionButton onClick={handleSearchClick} />
      </div>

      <Table.ScrollArea borderWidth="1px" rounded="md" height="80vh">
        <Table.Root size="md" stickyHeader marginBottom="120px">
          <Table.Header>
            <Table.Row bg="bg.subtle">
              <Table.ColumnHeader textAlign="center">M. ID</Table.ColumnHeader>
              <Table.ColumnHeader>Name</Table.ColumnHeader>
              <Table.ColumnHeader>Phone</Table.ColumnHeader>
              <Table.ColumnHeader>M. End Date</Table.ColumnHeader>
           
              <Table.ColumnHeader textAlign="end">Joined</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>

          <Table.Body>
  {items.map((item) => {
   // Get the badge color and display text based on the endDate
   const { color: badgeColor, displayText } = getBadgeColorByDateDifference(item.endDate);

   // Format the createdAt Firestore timestamp into the desired format
   const formattedDate = new Date(item.createdAt.seconds * 1000).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short", // "Apr"
    day: "numeric", // "1"
  });

    return (
      <Table.Row key={item.id}>
        <Table.Cell textAlign="center">{item.memberNo}</Table.Cell>
        <Table.Cell>{item.name}</Table.Cell>
        <Table.Cell>{item.phone}</Table.Cell>
        <Table.Cell>
        <Badge size="md" colorPalette={badgeColor}>
                    {displayText}
                  </Badge>
        </Table.Cell>
        <Table.Cell textAlign="end">{formattedDate}</Table.Cell>
      </Table.Row>
    );
  })}
</Table.Body>
        </Table.Root>
      </Table.ScrollArea>

      <BottomNavigationBar onSearchClick={handleFabClick} />

      {/* Drawer component */}
      <Drawer
        anchor='top'
        open={open}
        onClose={toggleDrawer}

      >

        <form onSubmit={handleSubmit}>
          <Stack gap={5} p={6}>
            {/* Member No */}
            <Box>
              <Text fontSize="sm">Member ID</Text>
              <Text fontSize="3xl" fontWeight="bold">{memberNo}</Text>
            </Box>

            {/* Name Field */}
            <Field label="Name" required>
            <Group attached width="100%">
            <InputAddon><PeopleIcon/></InputAddon>
              <Input
                ref={nameInputRef}
                variant="outline"
                size="xl"
                placeholder="Enter Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              </Group>
            </Field>

            {/* Phone Field */}
            <Field label="Phone" required>
            <Group attached width="100%">
            <InputAddon>+91</InputAddon>
              <Input
                variant="outline"
                size="xl"
                placeholder="Enter Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)} // Add state for phone
                type="tel"
              />
              </Group>
            </Field>

            {/* Type  Field */}
            
              <CheckboxGroup width="100%" required onChange={handleTrainingChange}>
              <Box pb={2} pt={2} overflowX="auto"> {/* This enables horizontal scrolling */}
                <Flex gap={3} justify="space-between" direction="row">
                  <CheckboxCard

                    label="Weight"
                    value="weight"
                    size="md"
                    colorPalette="teal"
                    variant="surface"
                    icon={<FitnessCenterIcon />}
                  />
                  <CheckboxCard

                    label="Cardio"
                    value="cardio"
                    size="md"
                    colorPalette="teal"
                    variant="surface"
                    icon={<SportsGymnasticsIcon />}
                  />
                  <CheckboxCard

                    label="Personal"
                    value="personal"
                    size="md"
                    colorPalette="teal"
                    variant="surface"
                    icon={<SportsKabaddiIcon />}
                  />
                </Flex>
                </Box>
              </CheckboxGroup>
      

            {/* Attendance Field */}
            <Field label="Period" required>
              <NativeSelect.Root size="xl" variant="outline">
                <NativeSelect.Field  onChange={handlePackageChange} value={selectedPackage}>
                  <option value={1}>1 Month</option>
                  <option value={3}>3 Month</option>
                  <option value={6}>6 Month</option>
                  <option value={12}>12 Month</option>
                </NativeSelect.Field>
                <NativeSelect.Indicator />
              </NativeSelect.Root>
            </Field>

            <Separator />

            <Stat.Root>
          <Stat.Label>Total Fees</Stat.Label>
          <HStack>
            <Stat.ValueText>
              {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(totalFees)}
            </Stat.ValueText>
            <Badge colorPalette="green">- ₹1200 Saving</Badge>
          </HStack>
          <Stat.HelpText>
            {selectedTraining.join(', ')} x {packageFees[selectedPackage]} Months
          </Stat.HelpText>
        </Stat.Root>

        <Separator />

        <Box>
        <Text fontSize="xs">Start Date - End Date</Text>
        <Text fontSize="lg" fontWeight="medium">
          {formatDate2(startDate)} - {endDate ? formatDate2(endDate) : ''}
        </Text>
      </Box>

        

            <Separator />

            {/* Action Buttons */}
            <Stack direction="row" justify="space-between" align="center">
              <ButtonGroup width="100%">
                <Button size="lg" variant="subtle" flex="1" onClick={toggleDrawer}>Close</Button>
                <Button size="lg" colorScheme="teal" flex="1" type="submit">Save</Button>
              </ButtonGroup>
            </Stack>
          </Stack>
        </form>
      </Drawer>



      {/* Fixed Search Bar */}
      {search && (
        <div style={{ position: 'fixed', top: 0, width: '100%', padding: '18px 16px', backgroundColor: 'white', zIndex: 2000 }}>

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
      {/* <div style={{position:"absolute"}}>
        <DrawerRoot open={open} placement="bottom">
          <DrawerBackdrop />
          <DrawerContent roundedTop="lg" bottom="0" zIndex="2000" >
            <DrawerHeader>
              <DrawerTitle>Drawer Title</DrawerTitle>
            </DrawerHeader>
            <DrawerBody>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </DrawerBody>
            <DrawerFooter>
              <DrawerCloseTrigger asChild>
                <Button variant="outline">Cancel</Button>
              </DrawerCloseTrigger>
              <Button>Save</Button>
            </DrawerFooter>
          </DrawerContent>
        </DrawerRoot>
        </div> */}

      {/* <Stat.Root>
          <Stat.Label>today</Stat.Label>
          <Stat.ValueText>{formattedDate}</Stat.ValueText>
        </Stat.Root>

        <Stat.Root>
          <Stat.Label>Yesterday</Stat.Label>
          <Stat.ValueText>Yesterdat</Stat.ValueText>
        </Stat.Root> */}




      {new Date().toDateString() === currentDate.toDateString() && <AddActionButton onClick={handleFabClick} />}
      {new Date().toDateString() !== currentDate.toDateString() && <ResetActionButton onClick={resetToToday} />}


      {/* <FloatingActionButton onClick={handleSearchClick} /> */}

    </>
  );
}


const trainingFees = {
  weight: 500,
  cardio: 300,
  personal: 2000,
};

const packageFees = {
  '1_month': 1,
  '3_months': 3,
  '6_months': 6,
  '12_months': 12,
};