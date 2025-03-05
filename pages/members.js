import { useState, useEffect, useRef } from 'react';
import { useSwipeable } from 'react-swipeable';  // Importing the swipeable hook
import {
  Table, Stat, Box, Input, FormControl, Stack, DrawerActionTrigger, Text, Separator, ButtonGroup, Textarea,
 Button, CheckboxGroup, Group, NativeSelect, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, StackSeparator,
  Flex, InputAddon, HStack, FormatNumber, Badge,
  Heading
} from '@chakra-ui/react';
import { Field } from '../components/ui/field';
import { RadioCardItem,RadioCardLabel,RadioCardRoot } from "@/components/ui/radio-card"
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

import { collection, getDocs, addDoc, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebaseConfig'; // Import Firestore config



export default function Members() {
  const [currentDate, setCurrentDate] = useState(new Date());
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

  const [selectedTraining, setSelectedTraining] = useState('weight');
  const [selectedPackage, setSelectedPackage] = useState(1);
  const [totalFees, setTotalFees] = useState(0);
  const [savings, setSavings] = useState(0);

  const [startDate, setStartDate] = useState(new Date());  // Start date is today
  const [endDate, setEndDate] = useState(null);  // This will hold the calculated end date



  useEffect(() => {
    fetchData();
  }, []);

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

    // Remove filtering by currentDate - fetch all data
    const sortedData = membersWithEndDate.sort((a, b) => b.memberNo - a.memberNo);

    setItems(sortedData);
    setMemberNo(sortedData.length + 1); // Update memberNo
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
    setSelectedTraining('weight');
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

    if (!capitalizedName || !phone || !selectedTraining) {
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

  const handleTrainingChange = (value) => {
    setSelectedTraining(value);  // Set the selected value (weight, cardio, personal)
  };

  const calculateSavings = () => {
    const basePrice = trainingFees[selectedTraining][1]*[selectedPackage]; // 1-month fee
    const selectedPrice = trainingFees[selectedTraining][selectedPackage]; // Selected package fee
    const savings = basePrice - selectedPrice;
    setSavings(savings);
    console.log(basePrice)
    return savings > 0 ? savings : 0;
    
  };

  const calculateTotalFees = (selectedTraining, selectedPackage) => {
    return trainingFees[selectedTraining][selectedPackage];
  };

  const handlePackageChange = (event) => {
    const selectedPackageValue = event.target.value;
    setSelectedPackage(selectedPackageValue);

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
  //  const trainingTotal = trainingFees[selectedTraining];
  //   const packageMultiplier = selectedPackage || 1;
    //setTotalFees(trainingTotal * packageMultiplier);

    // Calculate total fees based on selected training and package
  const total = calculateTotalFees(selectedTraining, selectedPackage);
  setTotalFees(total);

  // Calculate savings
  const savings = calculateSavings(selectedTraining, selectedPackage);
  //setSavings(savings); // Assuming you have a state for savings

    // Calculate the number of days to add (30 days per month)
    const daysToAdd = selectedPackage * 30;

    // Create a new Date object for the end date by adding the number of days
    const newEndDate = new Date(startDate); // Start with today's date (start date)
    newEndDate.setDate(newEndDate.getDate() + daysToAdd);

    // Set the end date
    setEndDate(newEndDate);
  }, [selectedTraining, selectedPackage]);

  // Utility function to determine badge color based on endDate
const getBadgeColorByDateDifference = (endDate) => {
  if (!endDate) {
    console.error("Invalid endDate.");
    return { color: "gray", displayText: "" }; // Return default gray color if endDate is invalid
  }

  // Convert endDate string to Date object
  const endDateObj = new Date(endDate);

  // Check if endDateObj is a valid Date
  if (isNaN(endDateObj.getTime())) {
    console.error("Invalid endDate object:", endDateObj);
    return { color: "gray", displayText: "" }; // Return default gray color if endDate conversion failed
  }

  // Get current date
  const currentDate = new Date();

  // Calculate the difference in milliseconds
  const diffTime = endDateObj - currentDate;

  // Convert milliseconds to days and round it to the nearest whole number
  const diffDays = Math.ceil(diffTime / (1000 * 3600 * 24)); // This rounds up to the nearest integer

  // Handle negative days (if endDate is in the past)
  if (diffDays < 0) {
    return { color: "red", displayText: `-${Math.abs(diffDays)} days`, variant: "solid" }; // Negative days
  }

  // Handle 0 days (if endDate is today)
  if (diffDays === 0) {
    return { color: "red", displayText: "Today", variant: "solid" }; // Display "Today" for today with red color
  }

  // Return color and display text based on the difference
  if (diffDays <= 3) {
    return { color: "red", displayText: `${diffDays} days`, variant: "subtle" }; // Less than or equal to 3 days
  } else if (diffDays <= 7) {
    return { color: "yellow", displayText: `${diffDays} days`, variant: "subtle" }; // Less than or equal to 7 days
  } else {
    return { color: "gray", displayText: formatDate2(endDate), variant: "subtle" }; // Display the actual date if more than 7 days
  }
};


  return (
    <>
      <div>
        <Box p={6} >
          <Heading>Total Members: {memberNo - 1}</Heading>
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
    const { color: badgeColor, displayText, variant } = getBadgeColorByDateDifference(item.endDate);

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
          <Badge size="md" colorPalette={badgeColor} variant={variant}>
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
                <InputAddon><PeopleIcon /></InputAddon>
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

            {/* Joining Date Field */}
            <Field label=" Joining Date" required>
              <Group attached width="100%">
                <InputAddon>Join</InputAddon>
                <Input
                  variant="outline"
                  size="xl"
                  type="date"
                  value={startDate.toISOString().split('T')[0]} // Display startDate in YYYY-MM-DD format
                  onChange={(e) => setStartDate(new Date(e.target.value))} // Add state for phone
                />
              </Group>
            </Field>

            {/* Type  Field */}
            <Field label="Training Type" required>
            <RadioCardRoot width="100%" required defaultValue="weight" >
              <Box pb={2} pl={1} pt={2} overflowX="auto"> {/* This enables horizontal scrolling */}
                <Flex gap={3} justify="space-between" direction="row">
                  <RadioCardItem

                    label="Weight"
                    value="weight"
                    size="md"
                    colorPalette="teal"
                    variant="surface"
                    icon={<FitnessCenterIcon />}
                    onChange={() => handleTrainingChange('weight')}
                    checked={selectedTraining === 'weight'}
                  />
                  <RadioCardItem

                    label="Cardio"
                    value="cardio"
                    size="md"
                    colorPalette="teal"
                    variant="surface"
                    icon={<SportsGymnasticsIcon />}
                    onChange={() => handleTrainingChange('cardio')}
                    checked={selectedTraining === 'cardio'}
                  />
                  <RadioCardItem

                    label="Personal"
                    value="personal"
                    size="md"
                    colorPalette="teal"
                    variant="surface"
                    icon={<SportsKabaddiIcon />}
                    onChange={() => handleTrainingChange('personal')}
                    checked={selectedTraining === 'personal'}
                  />
                </Flex>
              </Box>
            </RadioCardRoot>
            </Field>


            {/* Attendance Field */}
            <Field label="Period" required>
              <NativeSelect.Root size="xl" variant="outline">
                <NativeSelect.Field onChange={handlePackageChange} value={selectedPackage}>
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
    {savings > 0 && <Badge colorPalette="green" size="md">  {savings} Saving</Badge>}
  </HStack>
  <Stat.HelpText>
    {selectedTraining} x {selectedPackage} Months
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
     
      {new Date().toDateString() === currentDate.toDateString() && <AddActionButton onClick={handleFabClick} />}

    </>
  );
}


const trainingFees = {
  weight: {
    1: 500,
    3: 1300,
    6: 2400,
    12: 4500,
  },
  cardio: {
    1: 700,
    3: 1800,
    6: 4000,
    12: 7500,
  },
  personal: {
    1: 2000,
    3: 5000,
    6: 10000,
    12: 18000,
  },
};


const packageFees = {
  '1_month': 1,
  '3_months': 3,
  '6_months': 6,
  '12_months': 12,
};