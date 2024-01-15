"use client";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { usersData } from "../utility/data";

const ChipComponent = () => {
  const [inputValue, setInputValue] = useState("");
  const [chips, setChips] = useState([]);
  const [filteredData, setFilteredData] = useState(usersData);
  const [highlightedChip, setHighlightedChip] = useState(null);
  const [suggestionBoxStyle, setSuggestionBoxStyle] = useState({});

  const wrapperRef = useRef(null);
  const inputRef = useRef(null); // New ref for the input box

  const handleKeyDown = (e) => {
    if (e.key === "Backspace" && inputValue === "") {
      if (highlightedChip !== null) {
        // Delete the highlighted chip
        handleRemoveChip(highlightedChip);
        setHighlightedChip(null); // Reset highlighted chip
      } else if (chips.length > 0) {
        // Highlight the last chip
        setHighlightedChip(chips[chips.length - 1]);
      }
    }
  };

  const handleInputChange = (e) => {
    let value = e.target.value;
    if (value.startsWith(' ')) {
      value = value.replace(/^\s/, ''); // Removes the first whitespace character
    }
    setInputValue(value);
    if (e.target.value.length > 0) {
      setFilteredData(
        usersData.filter((item) =>
          item.name.toLowerCase().includes(value.toLowerCase())
        )
      );
    }
  };

  const handleInputClick = () => {
    console.log("ajksdfgashdfgkashjdfgaksdjfhgajks")
    // Show suggestions when input is clicked
   
       // Check if all usersData items are already added as chips
  const allAdded = usersData.every(user => chips.some(chip => chip.email === user.email));

  if (!allAdded) {
    setFilteredData(usersData); // Set filteredData only if not all items are added
  } else {
    // Optionally, you could clear filteredData or take some other action
    setFilteredData([]); // or any other appropriate action
  }
      setInputValue(" ")
   
  };

  const handleItemClick = (item) => {
    if (!chips.some((chip) => chip.email === item.email)) {
      setChips([...chips, item]);
      // Update filteredData to exclude the added chip
      setFilteredData(
        filteredData.filter((filteredItem) => filteredItem.email !== item.email)
      );
    }
  };

  const handleRemoveChip = (chip) => {
    setChips(chips.filter((c) => c.email !== chip.email));
    // Add back the removed chip into filteredData
    setFilteredData(
      [...filteredData, chip].sort((a, b) => a.name.localeCompare(b.name))
    ); // Assuming you want to sort them by name
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setInputValue(""); // Clear the input field
        setFilteredData(usersData); // Reset the filtered data to include all users
      }
    }

    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  useEffect(() => {
    const calculateSuggestionBoxPosition = () => {
      if (inputRef.current) {
        const { bottom, left } = inputRef.current.getBoundingClientRect();
        let totalChipsWidth = 0;
        // Calculate the total width of chips
        const chipsElements = wrapperRef.current.querySelectorAll(".chip"); // Assuming .chip is the class for chip divs
        chipsElements.forEach((chip) => {
          totalChipsWidth +=
            chip.offsetWidth +
            parseInt(window.getComputedStyle(chip).marginRight);
        });
        setSuggestionBoxStyle({
          position: "absolute",
          top: `${bottom}px`,
          left: `${left + totalChipsWidth}px`, // Adjust left position by total chips width
        });
      }
    };

    // Call the function to calculate position
    calculateSuggestionBoxPosition();

    // Re-calculate when chips are added/removed
    window.addEventListener("resize", calculateSuggestionBoxPosition);
    return () => {
      window.removeEventListener("resize", calculateSuggestionBoxPosition);
    };
  }, [chips, inputValue]); // Dependencies

  // This useEffect will update the filteredData based on the current inputValue
  // and make sure that the chips already selected are not included in it.
  useEffect(() => {
    setFilteredData(
      usersData.filter(
        (user) =>
          !chips.some((chip) => chip.email === user.email) &&
          user.name.toLowerCase().includes(inputValue.toLowerCase())
      )
    );
  }, [chips, inputValue]);

  return (
    <div className="flex flex-col  items-center w-full h-screen">
      <div className="mt-20 mb-10">
        <h1 className="text-3xl font-semibold">Chip Component</h1>
      </div>
      <div
        ref={wrapperRef}
        className="flex flex-wrap  gap-2 border border-zinc-400 h-auto min-h-20 w-2/3 rounded-md shadow-lg p-3"
      >
        <div className="flex flex-wrap flex-grow">
          {chips.map((chip, index) => (
            <div
              key={index}
              className={`flex items-center border border-gray-300 rounded-full px-2 py-1 m-1 ${
                chip === highlightedChip ? "bg-red-200" : "bg-zinc-200/50"
              }`}
            >
              <Image
                src={chip.icon}
                alt="user"
                height={25}
                width={25}
                className="w-8 h-8 mr-2"
              />
              <div className="flex flex-col">
                <span>{chip.name}</span>
                <span className="text-sm text-gray-500">{chip.email}</span>
              </div>
              <button className="px-2" onClick={() => handleRemoveChip(chip)}>
                <Image
                  src={"/close.svg"}
                  width={25}
                  height={25}
                  alt="close-icon"
                />
              </button>
            </div>
          ))}

          <input
            ref={inputRef} // Attach the ref to the input box
            type="text"
            className="text-start focus:outline-none"
            onClick={handleInputClick} // Add onClick event handler

            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            style={{ flexGrow: 1, flexBasis: "120px" }} // Ensuring the input has a base width and can grow
          />
        </div>
        {inputValue && filteredData.length > 0 && (
          <div
            className="absolute mt-6 w-auto  bg-white border border-gray-300 rounded-md shdow-lg"
            style={suggestionBoxStyle}
          >
            {filteredData.map((item, index) => (
              <div
                key={index}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleItemClick(item)}
              >
                <div className="flex items-center">
                  <Image
                    src={item.icon}
                    alt="user"
                    height={25}
                    width={25}
                    className="w-8 h-8 mr-3"
                  />
                  <div className="flex flex-col">
                    <span>{item.name}</span>
                    <span className="text-sm text-gray-500">{item.email}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChipComponent;
