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
  const inputRef = useRef(null);

  const handleKeyDown = (e) => {
    if (e.key === "Backspace" && inputValue === "") {
      if (highlightedChip !== null) {
        handleRemoveChip(highlightedChip);
        setHighlightedChip(null);
      } else if (chips.length > 0) {
        setHighlightedChip(chips[chips.length - 1]);
      }
    }
  };

  const handleInputChange = (e) => {
    let value = e.target.value;
    if (value.startsWith(" ")) {
      value = value.replace(/^\s/, "");
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
    const allAdded = usersData.every((user) =>
      chips.some((chip) => chip.email === user.email)
    );
    if (!allAdded) {
      setFilteredData(usersData);
    } else {
      setFilteredData([]);
    }
    setInputValue(" ");
  };

  const handleItemClick = (item) => {
    if (!chips.some((chip) => chip.email === item.email)) {
      setChips([...chips, item]);

      setFilteredData(
        filteredData.filter((filteredItem) => filteredItem.email !== item.email)
      );
    }
  };

  const handleRemoveChip = (chip) => {
    setChips(chips.filter((c) => c.email !== chip.email));

    setFilteredData(
      [...filteredData, chip].sort((a, b) => a.name.localeCompare(b.name))
    );
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setInputValue("");
        setFilteredData(usersData);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  useEffect(() => {
    const calculateSuggestionBoxPosition = () => {
      if (inputRef.current) {
        const { bottom, left } = inputRef.current.getBoundingClientRect();
        let totalChipsWidth = 0;

        const chipsElements = wrapperRef.current.querySelectorAll(".chip");
        chipsElements.forEach((chip) => {
          totalChipsWidth +=
            chip.offsetWidth +
            parseInt(window.getComputedStyle(chip).marginRight);
        });
        setSuggestionBoxStyle({
          position: "absolute",
          top: `${bottom}px`,
          left: `${left + totalChipsWidth}px`,
        });
      }
    };

    calculateSuggestionBoxPosition();

    window.addEventListener("resize", calculateSuggestionBoxPosition);
    return () => {
      window.removeEventListener("resize", calculateSuggestionBoxPosition);
    };
  }, [chips, inputValue]);

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
        className="flex flex-wrap  gap-2 border border-zinc-400 h-auto min-h-20 w-2/3 rounded-lg shadow-lg p-3"
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
            ref={inputRef}
            type="text"
            className="text-start focus:outline-none"
            onClick={handleInputClick}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            style={{ flexGrow: 1, flexBasis: "120px" }}
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
